const express = require('express');
const router = express.Router();
const { eAdmin } = require("../helpers/eAdmin");
const db = require('../db/models');
const bcrypt = require('bcryptjs');
const yup = require('yup');
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const upload = require('../helpers/uploadImgUser');
// O módulo fs permite interagir com o sistema de arquivos
const fs = require('fs');


router.get('/', eAdmin, async (req, res) => {
    try {
        // Recuperar o registro do banco de dados
        const user = await db.users.findOne({
            attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone', 'createdAt'],
            where: { id: req.user.dataValues.id },
            include: [
                { model: db.omes, as: 'ome', attributes: ['nome'], required: false },
                { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false },
                { model: db.situations, attributes: ['nameSituation'] }
            ],
        });

        if (user) {
            const matricula = user.matricula;
            
            // Encontrar o PM escalado com base na matrícula do usuário
            const pmEscalado = await db.escalas.findOne({
                attributes: ['id', 'pg', 'matricula', 'nome', 'ome_sgpm'],
                where: { matricula: matricula }
            });

            // Encontrar todas as escalas associadas à matrícula do usuário
            const escalasPorMatricula = await db.escalas.findAll({
                attributes: ['matricula', 'idome', 'modalidade', 'idevento', 'data_inicio', 'hora_inicio', 'hora_fim'],
                where: { matricula: matricula },
                include: [
                    { model: db.pjes, attributes: ['evento'], required: true },
                    { model: db.omes, attributes: ['nome'], required: true }
                ],
                order: [['data_inicio', 'ASC']],
            });

            if (!escalasPorMatricula || escalasPorMatricula.length === 0) {
                return res.render('admin/profile/view', {
                    layout: 'main',
                    profile: req.user.dataValues,
                    sidebarSituations: true,
                    danger_msg: 'Nenhuma Escala Encontrada!'
                });
            }

            const combinacoes = escalasPorMatricula.map(escala => ({
                idevento: escala.idevento,
                data_inicio: escala.data_inicio,
                hora_inicio: escala.hora_inicio,
                hora_fim: escala.hora_fim
            }));

            const eventosFullCalendar = [];
            for (const { idevento, data_inicio, hora_inicio, hora_fim } of combinacoes) {
                const escalasAssociados = await db.escalas.findAll({
                    attributes: ['id', 'pg', 'matricula', 'nome', 'ome_sgpm', 'modalidade', 'telefone', 'localap', 'anotacoes'],
                    where: {
                        idevento: idevento,
                        data_inicio: data_inicio,
                        hora_inicio: hora_inicio,
                        hora_fim: hora_fim
                    },
                    include: [
                        { model: db.pjes, attributes: ['evento'], required: true },
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    order: [
                        sequelize.literal(`CASE pg
                            WHEN 'CEL' THEN 1
                            WHEN 'TC' THEN 2
                            WHEN 'MAJ' THEN 3
                            WHEN 'CAP' THEN 4
                            WHEN '1º TEN' THEN 5
                            WHEN 'SUBTEN' THEN 6
                            WHEN '1º SGT' THEN 7
                            WHEN 'CB' THEN 8
                            WHEN 'SD' THEN 9
                            ELSE 10
                        END`)
                    ]
                });

                const startDateStr = `${data_inicio}T${hora_inicio}:00`;
                const endDateStr = `${data_inicio}T${hora_fim}:00`;

                const startDate = new Date(startDateStr);
                const endDate = new Date(endDateStr);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.error('Data inválida:', { startDateStr, endDateStr });
                    continue;
                }

                const nomeEvento = escalasAssociados[0]?.pje?.evento || 'Desconhecido';
                const omeNome = escalasAssociados[0]?.ome?.nome || 'Desconhecido';

                const associadosDetalhes = escalasAssociados.map(a =>
                    `${a.pg} ${a.matricula} ${a.nome} ${a.ome_sgpm} - ${a.telefone} | ${a.modalidade}\n - Local Apresentação: ${a.localap}\n - Obs:\n  --- ${a.anotacoes}
                    \n ___________________________________________ `
                ).join('\n\n');

                eventosFullCalendar.push({
                    title: nomeEvento + ` | ${hora_inicio} às ${hora_fim} | ${omeNome}`,
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    description: `Equipe:\n${associadosDetalhes}`
                });
            }

            return res.render('admin/profile/view', {
                layout: 'main',
                profile: req.user.dataValues,
                user,
                pmEscalado,
                eventosFullCalendar: JSON.stringify(eventosFullCalendar),
                sidebarSituations: true
            });
        } else {
            req.flash("danger_msg", "Erro: Usuário não encontrado!");
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Erro no processamento da requisição:', error);
        req.flash("danger_msg", "Erro interno do servidor.");
        return res.redirect('/login');
    }
});

router.get('/edit', eAdmin, async (req, res) => {

    const user = await db.users.findOne({
    
        attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone'],
    
        where: {
            id: req.user.dataValues.id
        }
    });
    if (user) {
        var dataForm = user.dataValues;
        return res.render('admin/profile/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm });
    } else {
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        return res.redirect('/login');
    }
});

router.post('/edit', eAdmin, async (req, res) => {
    
    var data = req.body;
    var dataForm = req.body;

    try {
        await schema.validate(data);
    } catch (error) {

        return res.render("admin/profile/edit", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: error.errors });
    }

    const user = await db.users.findOne({

        attributes: ['id', 'email'],

        where: {

            email: data.email,
            
            id: {

                [Op.ne]: req.user.dataValues.id
            }
        }
    });


    if (user) {

        return res.render("admin/profile/edit", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
    }

    db.users.update(data, { where: { id: req.user.dataValues.id } }).then(() => {

        req.user.dataValues.name = data.name;
        req.user.dataValues.email = data.email;

        req.flash("success_msg", "Perfil editado com sucesso!");

        return res.redirect('/profile');

    }).catch(() => {
        return res.render('admin/profile/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: "Perfil não editado com sucesso!" });
    });
});

router.get('/edit-password', eAdmin, async (req, res) => {
    
    const user = await db.users.findOne({
        attributes: ['id'],
        where: {id: req.user.dataValues.id}
    });

    if (user) {    
        return res.render('admin/profile/edit-password', { layout: 'main', profile: req.user.dataValues });
    } else {
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        return res.redirect('/login');
    }
});

router.post('/edit-password', eAdmin, async (req, res) => {

    var data = req.body;
    var dataForm = [];
    var password = data['password'];

    const schema = yup.object().shape({
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!")
    });

    try {
        await schema.validate(data);
    } catch (error) {
        dataForm['password'] = password;
        return res.render("admin/profile/edit-password", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: error.errors });
    }

    data.password = await bcrypt.hash(data.password, 8);

    db.users.update(data, { where: { id: req.user.dataValues.id } }).then(() => {
        req.flash("success_msg", "Senha editada com sucesso!");
        return res.redirect('/profile');

    }).catch(() => {
        
        return res.render('admin/profile/edit-password', { layout: 'main', profile: req.user.dataValues, danger_msg: "Senha não editada" });
    });

});

router.get('/edit-image', eAdmin, async (req, res) => {
    const user = await db.users.findOne({
        attributes: ['id', 'name', ['image', 'imageOld']],
        where: {
            id: req.user.dataValues.id
        }
    });

    if (user) {
        var dataForm = user.dataValues;
        res.render('admin/profile/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm });
    } else {
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        return res.redirect('/login');
    }
});

router.post('/edit-image', upload.single('image'), eAdmin, async (req, res) => {

    if (!req.file) {

        return res.render('admin/profile/edit-image', { layout: 'main', profile: req.user.dataValues, danger_msg: "Erro: Selecione uma foto válida JPEG ou PNG!" });
    }

    const user = await db.users.findOne({
        attributes: ['id', 'image'],
        where: {
            id: req.user.dataValues.id
        }    
    });
    

    if (user.dataValues.image) {
        var imgOld = "./public/images/users/" + user.dataValues.image;
        fs.access(imgOld, (err) => {
            
            if (!err) {
                // Apagar a imagem antiga
                fs.unlink(imgOld, () => { })
            }
        });
    }

    db.users.update({ image: req.file.filename }, { where: { id: req.user.dataValues.id } }).then(() => {
    
        req.user.dataValues.image = req.file.filename;        
        req.flash("success_msg", "Foto editada com sucesso!");
        return res.redirect('/profile');

    }).catch(() => {
        return res.render('admin/profile/edit-image', { layout: 'main', profile: req.user.dataValues, danger_msg: "Erro: Foto não editada com sucesso!" });
    });
    
});

module.exports = router;



