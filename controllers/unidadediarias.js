const express = require('express');
const router = express.Router();
const { eAdmin } = require("../helpers/eAdmin");
const db = require('../db/models');
const Sequelize = require('sequelize');

// Definição da rota GET
router.get('/', eAdmin, async (req, res) => {
    try {
        const nomeMes = req.session.mes;
        const mes = req.session.mes;
        const nomeAno = req.session.ano;
        const ano = req.session.ano;
        const { Op } = Sequelize;
        const { page = 1 } = req.query;
        const limit = 40;


        // INICIO DIARIAS DIM
        if (req.user.dataValues.omeId == 2){ 
            const countdiarias = await db.diarias.count();
            if (countdiarias === 0) {
                return res.render("unidade/unidadediarias/list", {
                    layout: 'main',
                    profile: req.user.dataValues,
                    sidebarSituations: true,
                    danger_msg: 'Erro: Nenhum diarias encontrada!'
                });
            }

            // Tabela de cotas distribuídas
            const total_cotadistunidade = await db.diarias.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
                    [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'), 'total_cotadist_original'],
                    [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
                    [Sequelize.literal('SUM(cotadist)'), 'total_cotadist'],
                    [Sequelize.literal('SUM(cotadist) * 180'), 'total_cotadist_multiplicado']
                ],
                where: { idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], mes, ano },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

            // Tabela de cotas executadas
            const total_cotaexeunidade = await db.diariasgercota.findAll({
                attributes: [
                    'id', 'id_ome', 'ttexe', 'mes', 'ano', 'obs',
                    [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
                    [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado']
                ],
                where: { id_ome: [2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], mes, ano },
                include: [{ model: db.omes, attributes: ['nome'] }],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

            // Valor final de cotas distribuídas
            const valorfinal_cotadistunidade = await db.diarias.findAll({
                attributes: [
                    [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
                ],
                where: { idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], mes, ano },
                raw: true,
            });

            // Valor de cotas executadas
            const valorfinal_cotaexeunidade = await db.diariasgercota.findAll({
                attributes: [
                    [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
                ],
                where: { id_ome: [2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], mes, ano },
                raw: true,
            });

            // Calcular valores totais
            const valorCotaDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotadist_multiplicado) || 0;
            const totalcotaDistUnidadeOrig = parseFloat(total_cotadistunidade[0]?.total_cotadist_original) || 0;
            const totalcotaDistUnidadeRef = parseFloat(total_cotadistunidade[0]?.total_cotadist_reforco) || 0;
            const totalcotaDistUnidade = valorCotaDistUnidade / 180;
            const valorCotaExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaexe_multiplicado) || 0;
            const totalcotaExeUnidade = valorCotaExeUnidade / 180;
            const saldoFinalUnidade = totalcotaDistUnidade - totalcotaExeUnidade;

            // Converter mês para inglês
            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN': return 'JAN';
                    case 'FEV': return 'FEB';
                    case 'MAR': return 'MAR';
                    case 'ABR': return 'APR';
                    case 'MAI': return 'MAY';
                    case 'JUN': return 'JUN';
                    case 'JUL': return 'JUL';
                    case 'AGO': return 'AUG';
                    case 'SET': return 'SEP';
                    case 'OUT': return 'OCT';
                    case 'NOV': return 'NOV';
                    case 'DEZ': return 'DEC';
                    default: return nomeMesPT;
                }
            }

            // Obter detalhes do usuário
            const user = await db.users.findOne({
                attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                where: { id: req.user.dataValues.id },
                include: [{ model: db.situations, attributes: ['nameSituation'] }]
            });

            // Obter diárias
            const diarias = await db.diarias.findAll({
                attributes: [
                    'id', 'idome', 'evento', 'operacao', 'cotadist', 'obs', 'sei', 'mes', 'ano', 'iduser', 'iddiretoria', 'idfpg',
                ],
                where: { idome: [2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], mes, ano },
                order: [['id', 'DESC']],
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.omes, as: 'idfpgOme', attributes: ['nome'], required: false },
                    { model: db.users, attributes: ['name'] }
                ],
            });

            // Renderizar resposta
            if (diarias.length !== 0) {
                return res.render("unidade/unidadediarias/list", {
                    layout: 'main',
                    profile: req.user.dataValues,
                    user,
                    nomeMes,
                    nomeAno,
                    sidebarSituations: true,
                    diarias: diarias.map(id => id.toJSON()),

                    valorCotaDistUnidade,
                    valorCotaExeUnidade,
                    saldoFinalUnidade,
                    total_cotadistunidade,
                    totalcotaDistUnidadeOrig,
                    totalcotaDistUnidadeRef,
                    total_cotaexeunidade,
                    totalcotaDistUnidade,
                    totalcotaExeUnidade
                });
            } else {
                return res.render("unidade/unidadediarias/list", {
                    layout: 'main',
                    profile: req.user.dataValues,
                    sidebarSituations: true,
                    danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                });
            }

        }
        // FIM DIARIAS DIM


        // INICIO DIARIAS DIRESP
        else if(req.user.dataValues.omeId == 3){

                const countdiarias = await db.diarias.count();
                if (countdiarias === 0) {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        sidebarSituations: true,
                        danger_msg: 'Erro: Nenhum diarias encontrada!'
                    });
                }
    
                // Tabela de cotas distribuídas
                const total_cotadistunidade = await db.diarias.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
                        [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'), 'total_cotadist_original'],
                        [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
                        [Sequelize.literal('SUM(cotadist)'), 'total_cotadist'],
                        [Sequelize.literal('SUM(cotadist) * 180'), 'total_cotadist_multiplicado']
                    ],
                    where: { idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]},
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });
    
                // Tabela de cotas executadas
                const total_cotaexeunidade = await db.diariasgercota.findAll({
                    attributes: [
                        'id', 'id_ome', 'ttexe', 'mes', 'ano', 'obs',
                        [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
                        [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado']
                    ],
                    where: { id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33], mes, ano },
                    include: [{ model: db.omes, attributes: ['nome'] }],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });
    
                // Valor final de cotas distribuídas
                const valorfinal_cotadistunidade = await db.diarias.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
                    ],
                    where: { idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33], mes, ano },
                    raw: true,
                });
    
                // Valor de cotas executadas
                const valorfinal_cotaexeunidade = await db.diariasgercota.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
                    ],
                    where: { id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33], mes, ano },
                    raw: true,
                });
    
                // Calcular valores totais
                const valorCotaDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotadist_multiplicado) || 0;
                const totalcotaDistUnidadeOrig = parseFloat(total_cotadistunidade[0]?.total_cotadist_original) || 0;
                const totalcotaDistUnidadeRef = parseFloat(total_cotadistunidade[0]?.total_cotadist_reforco) || 0;
                const totalcotaDistUnidade = valorCotaDistUnidade / 180;
                const valorCotaExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaexe_multiplicado) || 0;
                const totalcotaExeUnidade = valorCotaExeUnidade / 180;
                const saldoFinalUnidade = totalcotaDistUnidade - totalcotaExeUnidade;
    
                // Converter mês para inglês
                function converterMesPTparaEN(nomeMesPT) {
                    switch (nomeMesPT) {
                        case 'JAN': return 'JAN';
                        case 'FEV': return 'FEB';
                        case 'MAR': return 'MAR';
                        case 'ABR': return 'APR';
                        case 'MAI': return 'MAY';
                        case 'JUN': return 'JUN';
                        case 'JUL': return 'JUL';
                        case 'AGO': return 'AUG';
                        case 'SET': return 'SEP';
                        case 'OUT': return 'OCT';
                        case 'NOV': return 'NOV';
                        case 'DEZ': return 'DEC';
                        default: return nomeMesPT;
                    }
                }
    
                // Obter detalhes do usuário
                const user = await db.users.findOne({
                    attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                    where: { id: req.user.dataValues.id },
                    include: [{ model: db.situations, attributes: ['nameSituation'] }]
                });
    
                // Obter diárias
                const diarias = await db.diarias.findAll({
                    attributes: [
                        'id', 'idome', 'evento', 'operacao', 'cotadist', 'obs', 'sei', 'mes', 'ano', 'iduser', 'iddiretoria', 'idfpg',
                    ],
                    where: { idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33], mes, ano },
                    order: [['id', 'DESC']],
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.omes, as: 'idfpgOme', attributes: ['nome'], required: false },
                        { model: db.users, attributes: ['name'] }
                    ],
                });
    
                // Renderizar resposta
                if (diarias.length !== 0) {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        user,
                        nomeMes,
                        nomeAno,
                        sidebarSituations: true,
                        diarias: diarias.map(id => id.toJSON()),
    
                        valorCotaDistUnidade,
                        valorCotaExeUnidade,
                        saldoFinalUnidade,
                        total_cotadistunidade,
                        totalcotaDistUnidadeOrig,
                        totalcotaDistUnidadeRef,
                        total_cotaexeunidade,
                        totalcotaDistUnidade,
                        totalcotaExeUnidade
                    });
                } else {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        sidebarSituations: true,
                        danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                    });
                }

        }
        // FIM DIARIAS DIRESP


        // INICIO DIARIAS DINTER I
        else if (req.user.dataValues.omeId == 4){

                const countdiarias = await db.diarias.count();
                if (countdiarias === 0) {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        sidebarSituations: true,
                        danger_msg: 'Erro: Nenhum diarias encontrada!'
                    });
                }
    
                // Tabela de cotas distribuídas
                const total_cotadistunidade = await db.diarias.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
                        [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'), 'total_cotadist_original'],
                        [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
                        [Sequelize.literal('SUM(cotadist)'), 'total_cotadist'],
                        [Sequelize.literal('SUM(cotadist) * 180'), 'total_cotadist_multiplicado']
                    ],
                    where: { idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],},
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });
    
                // Tabela de cotas executadas
                const total_cotaexeunidade = await db.diariasgercota.findAll({
                    attributes: [
                        'id', 'id_ome', 'ttexe', 'mes', 'ano', 'obs',
                        [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
                        [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado']
                    ],
                    where: { id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], mes, ano },
                    include: [{ model: db.omes, attributes: ['nome'] }],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });
    
                // Valor final de cotas distribuídas
                const valorfinal_cotadistunidade = await db.diarias.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
                    ],
                    where: { idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], mes, ano },
                    raw: true,
                });
    
                // Valor de cotas executadas
                const valorfinal_cotaexeunidade = await db.diariasgercota.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
                    ],
                    where: { id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], mes, ano },
                    raw: true,
                });
    
                // Calcular valores totais
                const valorCotaDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotadist_multiplicado) || 0;
                const totalcotaDistUnidadeOrig = parseFloat(total_cotadistunidade[0]?.total_cotadist_original) || 0;
                const totalcotaDistUnidadeRef = parseFloat(total_cotadistunidade[0]?.total_cotadist_reforco) || 0;
                const totalcotaDistUnidade = valorCotaDistUnidade / 180;
                const valorCotaExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaexe_multiplicado) || 0;
                const totalcotaExeUnidade = valorCotaExeUnidade / 180;
                const saldoFinalUnidade = totalcotaDistUnidade - totalcotaExeUnidade;
    
                // Converter mês para inglês
                function converterMesPTparaEN(nomeMesPT) {
                    switch (nomeMesPT) {
                        case 'JAN': return 'JAN';
                        case 'FEV': return 'FEB';
                        case 'MAR': return 'MAR';
                        case 'ABR': return 'APR';
                        case 'MAI': return 'MAY';
                        case 'JUN': return 'JUN';
                        case 'JUL': return 'JUL';
                        case 'AGO': return 'AUG';
                        case 'SET': return 'SEP';
                        case 'OUT': return 'OCT';
                        case 'NOV': return 'NOV';
                        case 'DEZ': return 'DEC';
                        default: return nomeMesPT;
                    }
                }
    
                // Obter detalhes do usuário
                const user = await db.users.findOne({
                    attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                    where: { id: req.user.dataValues.id },
                    include: [{ model: db.situations, attributes: ['nameSituation'] }]
                });
    
                // Obter diárias
                const diarias = await db.diarias.findAll({
                    attributes: [
                        'id', 'idome', 'evento', 'operacao', 'cotadist', 'obs', 'sei', 'mes', 'ano', 'iduser', 'iddiretoria', 'idfpg',
                    ],
                    where: { idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], mes, ano },
                    order: [['id', 'DESC']],
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.omes, as: 'idfpgOme', attributes: ['nome'], required: false },
                        { model: db.users, attributes: ['name'] }
                    ],
                });
    
                // Renderizar resposta
                if (diarias.length !== 0) {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        user,
                        nomeMes,
                        nomeAno,
                        sidebarSituations: true,
                        diarias: diarias.map(id => id.toJSON()),
    
                        valorCotaDistUnidade,
                        valorCotaExeUnidade,
                        saldoFinalUnidade,
                        total_cotadistunidade,
                        totalcotaDistUnidadeOrig,
                        totalcotaDistUnidadeRef,
                        total_cotaexeunidade,
                        totalcotaDistUnidade,
                        totalcotaExeUnidade
                    });
                } else {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        sidebarSituations: true,
                        danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                    });
                }

        }
        // FIM DIARIAS DINTER I


        // INICIO DIARIAS DINTER II
        else if(req.user.dataValues.omeId == 5){

                const countdiarias = await db.diarias.count();
                if (countdiarias === 0) {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        sidebarSituations: true,
                        danger_msg: 'Erro: Nenhum diarias encontrada!'
                    });
                }
    
                // Tabela de cotas distribuídas
                const total_cotadistunidade = await db.diarias.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
                        [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'), 'total_cotadist_original'],
                        [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
                        [Sequelize.literal('SUM(cotadist)'), 'total_cotadist'],
                        [Sequelize.literal('SUM(cotadist) * 180'), 'total_cotadist_multiplicado']
                    ],
                    where: { idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],},
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });
    
                // Tabela de cotas executadas
                const total_cotaexeunidade = await db.diariasgercota.findAll({
                    attributes: [
                        'id', 'id_ome', 'ttexe', 'mes', 'ano', 'obs',
                        [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
                        [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado']
                    ],
                    where: { id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], mes, ano },
                    include: [{ model: db.omes, attributes: ['nome'] }],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });
    
                // Valor final de cotas distribuídas
                const valorfinal_cotadistunidade = await db.diarias.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
                    ],
                    where: { idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], mes, ano },
                    raw: true,
                });
    
                // Valor de cotas executadas
                const valorfinal_cotaexeunidade = await db.diariasgercota.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
                    ],
                    where: { id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], mes, ano },
                    raw: true,
                });
    
                // Calcular valores totais
                const valorCotaDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotadist_multiplicado) || 0;
                const totalcotaDistUnidadeOrig = parseFloat(total_cotadistunidade[0]?.total_cotadist_original) || 0;
                const totalcotaDistUnidadeRef = parseFloat(total_cotadistunidade[0]?.total_cotadist_reforco) || 0;
                const totalcotaDistUnidade = valorCotaDistUnidade / 180;
                const valorCotaExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaexe_multiplicado) || 0;
                const totalcotaExeUnidade = valorCotaExeUnidade / 180;
                const saldoFinalUnidade = totalcotaDistUnidade - totalcotaExeUnidade;
    
                // Converter mês para inglês
                function converterMesPTparaEN(nomeMesPT) {
                    switch (nomeMesPT) {
                        case 'JAN': return 'JAN';
                        case 'FEV': return 'FEB';
                        case 'MAR': return 'MAR';
                        case 'ABR': return 'APR';
                        case 'MAI': return 'MAY';
                        case 'JUN': return 'JUN';
                        case 'JUL': return 'JUL';
                        case 'AGO': return 'AUG';
                        case 'SET': return 'SEP';
                        case 'OUT': return 'OCT';
                        case 'NOV': return 'NOV';
                        case 'DEZ': return 'DEC';
                        default: return nomeMesPT;
                    }
                }
    
                // Obter detalhes do usuário
                const user = await db.users.findOne({
                    attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                    where: { id: req.user.dataValues.id },
                    include: [{ model: db.situations, attributes: ['nameSituation'] }]
                });
    
                // Obter diárias
                const diarias = await db.diarias.findAll({
                    attributes: [
                        'id', 'idome', 'evento', 'operacao', 'cotadist', 'obs', 'sei', 'mes', 'ano', 'iduser', 'iddiretoria', 'idfpg',
                    ],
                    where: { idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], mes, ano },
                    order: [['id', 'DESC']],
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.omes, as: 'idfpgOme', attributes: ['nome'], required: false },
                        { model: db.users, attributes: ['name'] }
                    ],
                });
    
                // Renderizar resposta
                if (diarias.length !== 0) {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        user,
                        nomeMes,
                        nomeAno,
                        sidebarSituations: true,
                        diarias: diarias.map(id => id.toJSON()),
    
                        valorCotaDistUnidade,
                        valorCotaExeUnidade,
                        saldoFinalUnidade,
                        total_cotadistunidade,
                        totalcotaDistUnidadeOrig,
                        totalcotaDistUnidadeRef,
                        total_cotaexeunidade,
                        totalcotaDistUnidade,
                        totalcotaExeUnidade
                    });
                } else {
                    return res.render("unidade/unidadediarias/list", {
                        layout: 'main',
                        profile: req.user.dataValues,
                        sidebarSituations: true,
                        danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                    });
                }

        }
        // FIM DIARIAS DINTER II

        // INICIO USUARIO DA OME
        else {
            const countdiarias = await db.diarias.count();
            if (countdiarias === 0) {
                return res.render("unidade/unidadediarias/list", {
                    layout: 'main',
                    profile: req.user.dataValues,
                    sidebarSituations: true,
                    danger_msg: 'Erro: Nenhum diarias encontrada!'
                });
            }

            // Tabela de cotas distribuídas
            const total_cotadistunidade = await db.diarias.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
                    [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'), 'total_cotadist_original'],
                    [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
                    [Sequelize.literal('SUM(cotadist)'), 'total_cotadist'],
                    [Sequelize.literal('SUM(cotadist) * 180'), 'total_cotadist_multiplicado']
                ],
                where: { idome: req.user.dataValues.omeId, mes, ano },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

            // Tabela de cotas executadas
            const total_cotaexeunidade = await db.diariasgercota.findAll({
                attributes: [
                    'id', 'id_ome', 'ttexe', 'mes', 'ano', 'obs',
                    [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
                    [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado']
                ],
                where: { id_ome: req.user.dataValues.omeId, mes, ano },
                include: [{ model: db.omes, attributes: ['nome'] }],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

            // Valor final de cotas distribuídas
            const valorfinal_cotadistunidade = await db.diarias.findAll({
                attributes: [
                    [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
                ],
                where: { idome: req.user.dataValues.omeId, mes, ano },
                raw: true,
            });

            // Valor de cotas executadas
            const valorfinal_cotaexeunidade = await db.diariasgercota.findAll({
                attributes: [
                    [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
                ],
                where: { id_ome: req.user.dataValues.omeId, mes, ano },
                raw: true,
            });

            // Calcular valores totais
            const valorCotaDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotadist_multiplicado) || 0;
            const totalcotaDistUnidadeOrig = parseFloat(total_cotadistunidade[0]?.total_cotadist_original) || 0;
            const totalcotaDistUnidadeRef = parseFloat(total_cotadistunidade[0]?.total_cotadist_reforco) || 0;
            const totalcotaDistUnidade = valorCotaDistUnidade / 180;
            const valorCotaExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaexe_multiplicado) || 0;
            const totalcotaExeUnidade = valorCotaExeUnidade / 180;
            const saldoFinalUnidade = totalcotaDistUnidade - totalcotaExeUnidade;

            // Converter mês para inglês
            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN': return 'JAN';
                    case 'FEV': return 'FEB';
                    case 'MAR': return 'MAR';
                    case 'ABR': return 'APR';
                    case 'MAI': return 'MAY';
                    case 'JUN': return 'JUN';
                    case 'JUL': return 'JUL';
                    case 'AGO': return 'AUG';
                    case 'SET': return 'SEP';
                    case 'OUT': return 'OCT';
                    case 'NOV': return 'NOV';
                    case 'DEZ': return 'DEC';
                    default: return nomeMesPT;
                }
            }

            // Obter detalhes do usuário
            const user = await db.users.findOne({
                attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                where: { id: req.user.dataValues.id },
                include: [{ model: db.situations, attributes: ['nameSituation'] }]
            });

            // Obter diárias
            const diarias = await db.diarias.findAll({
                attributes: [
                    'id', 'idome', 'evento', 'operacao', 'cotadist', 'obs', 'sei', 'mes', 'ano', 'iduser', 'iddiretoria', 'idfpg',
                ],
                where: { idome: req.user.dataValues.omeId, mes, ano },
                order: [['id', 'DESC']],
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.omes, as: 'idfpgOme', attributes: ['nome'], required: false },
                    { model: db.users, attributes: ['name'] }
                ],
            });

            // Renderizar resposta
            if (diarias.length !== 0) {
                return res.render("unidade/unidadediarias/list", {
                    layout: 'main',
                    profile: req.user.dataValues,
                    user,
                    nomeMes,
                    nomeAno,
                    sidebarSituations: true,
                    diarias: diarias.map(id => id.toJSON()),

                    valorCotaDistUnidade,
                    valorCotaExeUnidade,
                    saldoFinalUnidade,
                    total_cotadistunidade,
                    totalcotaDistUnidadeOrig,
                    totalcotaDistUnidadeRef,
                    total_cotaexeunidade,
                    totalcotaDistUnidade,
                    totalcotaExeUnidade
                });
            } else {
                return res.render("unidade/unidadediarias/list", {
                    layout: 'main',
                    profile: req.user.dataValues,
                    sidebarSituations: true,
                    danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                });
            }
        }
        // FIM USUARIO DA OME
        
        } catch (error) {
        // Em caso de erro, renderizar resposta de erro
        return res.render("unidade/unidadediarias/list", {
            layout: 'main',
            profile: req.user.dataValues,
            sidebarSituations: true,
            danger_msg: 'Erro: Nenhum Evento Cadastrado!'
            });
        }

    });

module.exports = router;