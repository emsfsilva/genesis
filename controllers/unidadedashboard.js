/*const express = require('express');
const router = express.Router();
const { eAdmin } = require("../helpers/eAdmin");
const db = require('../db/models');

router.get('/', eAdmin, async (req, res) => {
  
    res.render("unidade/dashboard/dashboard", { layout: 'main', profile: req.user.dataValues, sidebarDashboard: true });
});

module.exports = router;

*/


const express = require('express');
const router = express.Router();
const { eAdmin } = require("../helpers/eAdmin");
const db = require('./../db/models');
const Sequelize = require('sequelize');
const sequelize = db.sequelize; // Importe a instância do Sequelize
const { Op } = require('sequelize');

router.get('/', eAdmin, async (req, res) => {
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();
  const mesAtual = dataAtual.getMonth() + 1;

  try {
      // Consulta para total_cotadist
      const total_cotadist = await db.tetopjes.findAll({
          attributes: [
              'ano',
              [Sequelize.literal(
                  `CASE mes
                      WHEN '1' THEN 'JAN'
                      WHEN '2' THEN 'FEV'
                      WHEN '3' THEN 'MAR'
                      WHEN '4' THEN 'ABR'
                      WHEN '5' THEN 'MAI'
                      WHEN '6' THEN 'JUN'
                      WHEN '7' THEN 'JUL'
                      WHEN '8' THEN 'AGO'
                      WHEN '9' THEN 'SET'
                      WHEN '10' THEN 'OUT'
                      WHEN '11' THEN 'NOV'
                      WHEN '12' THEN 'DEZ'
                      ELSE 'DESCONHECIDO'
                  END`
              ), 'mes_nome'],
              [Sequelize.literal('SUM(ctgeralinicialof)'), 'total_ctgeralinicialof'],
              [Sequelize.literal('SUM(ctgeralinicialprc)'), 'total_ctgeralinicialprc'],
              [Sequelize.literal('SUM(ctgeralinicialof) * 300'), 'total_ctgeralinicialof_multiplicado'],
              [Sequelize.literal('SUM(ctgeralinicialprc) * 200'), 'total_ctgeralinicialprc_multiplicado'],
                            
          ],
          where: {
              ano: anoAtual,
              mes: { [Sequelize.Op.lte]: mesAtual }
          },
          raw: true,
          group: ['mes_nome', 'ano'],
          order: [
              ['ano', 'ASC'],
              [Sequelize.literal(
                  `CASE mes
                      WHEN '1' THEN 1
                      WHEN '2' THEN 2
                      WHEN '3' THEN 3
                      WHEN '4' THEN 4
                      WHEN '5' THEN 5
                      WHEN '6' THEN 6
                      WHEN '7' THEN 7
                      WHEN '8' THEN 8
                      WHEN '9' THEN 9
                      WHEN '10' THEN 10
                      WHEN '11' THEN 11
                      WHEN '12' THEN 12
                      ELSE 13
                  END`
              ), 'ASC']
          ]
      });

      // Consulta para total_cotaexe
      const total_cotaexe = await db.pjesgercota.findAll({
          attributes: [
              'ano',
              [Sequelize.literal(
                  `CASE mes
                      WHEN 'JAN' THEN 'JAN'
                      WHEN 'FEV' THEN 'FEV'
                      WHEN 'MAR' THEN 'MAR'
                      WHEN 'ABR' THEN 'ABR'
                      WHEN 'MAI' THEN 'MAI'
                      WHEN 'JUN' THEN 'JUN'
                      WHEN 'JUL' THEN 'JUL'
                      WHEN 'AGO' THEN 'AGO'
                      WHEN 'SET' THEN 'SET'
                      WHEN 'OUT' THEN 'OUT'
                      WHEN 'NOV' THEN 'NOV'
                      WHEN 'DEZ' THEN 'DEZ'
                      ELSE 'DESCONHECIDO'
                  END`
              ), 'mes_nome'],
              [Sequelize.literal('SUM(ttofexe)'), 'total_ttofexe'],
              [Sequelize.literal('SUM(ttprcexe)'), 'total_ttprcexe'],
              [Sequelize.literal('SUM(ttofexe) * 300'), 'total_ttofexe_multiplicado'],
              [Sequelize.literal('SUM(ttprcexe) * 200'), 'total_ttprcexe_multiplicado'],
          ],
          where: {
              operacao: {
                  [Sequelize.Op.like]: 'PJES GOVERNO%',
              },
          },
          raw: true,
          group: ['mes_nome', 'ano'],
          order: [
              ['ano', 'ASC'],
              [Sequelize.literal(
                  `CASE mes
                      WHEN 'JAN' THEN 1
                      WHEN 'FEV' THEN 2
                      WHEN 'MAR' THEN 3
                      WHEN 'ABR' THEN 4
                      WHEN 'MAI' THEN 5
                      WHEN 'JUN' THEN 6
                      WHEN 'JUL' THEN 7
                      WHEN 'AGO' THEN 8
                      WHEN 'SET' THEN 9
                      WHEN 'OUT' THEN 10
                      WHEN 'NOV' THEN 11
                      WHEN 'DEZ' THEN 12
                      ELSE 13
                  END`
              ), 'ASC']
          ]
      });

      // Calculando as diferenças anuais
      let totalCtgeralinicialof = 0;
      let totalCtgeralinicialprc = 0;
      let totalTtofexe = 0;
      let totalTtprcexe = 0;

      total_cotadist.forEach(item => {
          totalCtgeralinicialof += parseFloat(item.total_ctgeralinicialof) || 0;
          totalCtgeralinicialprc += parseFloat(item.total_ctgeralinicialprc) || 0;
      });

      total_cotaexe.forEach(item => {
          totalTtofexe += parseFloat(item.total_ttofexe) || 0;
          totalTtprcexe += parseFloat(item.total_ttprcexe) || 0;
      });

      const SaldoTtCotaOfGeral = totalCtgeralinicialof - totalTtofexe;
      const SaldoTtCotaPrcGeral = totalCtgeralinicialprc - totalTtprcexe;

      // Combinando e subtraindo dados
      const combinedData = total_cotadist.map(cotaDist => {
          // Encontrar o item correspondente em total_cotaexe
          const matchingExe = total_cotaexe.find(exe => exe.mes_nome === cotaDist.mes_nome && exe.ano === cotaDist.ano) || {};

          // Calcular as diferenças
          return {
              mes: cotaDist.mes_nome,
              ano: cotaDist.ano,
              total_cotaofdist_diff: (parseFloat(cotaDist.total_ctgeralinicialof) || 0) - (parseFloat(matchingExe.total_ttofexe) || 0),
              total_cotaprcdist_diff: (parseFloat(cotaDist.total_ctgeralinicialprc) || 0) - (parseFloat(matchingExe.total_ttprcexe) || 0),
              total_cotaofdist_multiplicado_diff: (parseFloat(cotaDist.total_ctgeralinicialof_multiplicado) || 0) - (parseFloat(matchingExe.total_ttofexe_multiplicado) || 0),
              total_cotaprcdist_multiplicado_diff: (parseFloat(cotaDist.total_ctgeralinicialprc_multiplicado) || 0) - (parseFloat(matchingExe.total_ttprcexe_multiplicado) || 0),
          };
      });















      // Consulta para total_cotadist
      const total_cotadiaria = await db.tetodiarias.findAll({
        attributes: [
            'ano',
            [Sequelize.literal(
                `CASE mes
                    WHEN '1' THEN 'JAN'
                    WHEN '2' THEN 'FEV'
                    WHEN '3' THEN 'MAR'
                    WHEN '4' THEN 'ABR'
                    WHEN '5' THEN 'MAI'
                    WHEN '6' THEN 'JUN'
                    WHEN '7' THEN 'JUL'
                    WHEN '8' THEN 'AGO'
                    WHEN '9' THEN 'SET'
                    WHEN '10' THEN 'OUT'
                    WHEN '11' THEN 'NOV'
                    WHEN '12' THEN 'DEZ'
                    ELSE 'DESCONHECIDO'
                END`
            ), 'mes_nome'],
            [Sequelize.literal('SUM(ctgeralinicial)'), 'total_ctgeralinicial'],
            [Sequelize.literal('SUM(ctgeralinicial) * 180'), 'total_ctgeralinicial_multiplicado'],
            
                          
        ],
        where: {
            ano: anoAtual,
            mes: { [Sequelize.Op.lte]: mesAtual }
        },
        raw: true,
        group: ['mes_nome', 'ano'],
        order: [
            ['ano', 'ASC'],
            [Sequelize.literal(
                `CASE mes
                    WHEN '1' THEN 1
                    WHEN '2' THEN 2
                    WHEN '3' THEN 3
                    WHEN '4' THEN 4
                    WHEN '5' THEN 5
                    WHEN '6' THEN 6
                    WHEN '7' THEN 7
                    WHEN '8' THEN 8
                    WHEN '9' THEN 9
                    WHEN '10' THEN 10
                    WHEN '11' THEN 11
                    WHEN '12' THEN 12
                    ELSE 13
                END`
            ), 'ASC']
        ]
    });

    // Consulta para total_cotaexe
    const total_diariaexe = await db.diariasgercota.findAll({
        attributes: [
            'ano',
            [Sequelize.literal(
                `CASE mes
                    WHEN 'JAN' THEN 'JAN'
                    WHEN 'FEV' THEN 'FEV'
                    WHEN 'MAR' THEN 'MAR'
                    WHEN 'ABR' THEN 'ABR'
                    WHEN 'MAI' THEN 'MAI'
                    WHEN 'JUN' THEN 'JUN'
                    WHEN 'JUL' THEN 'JUL'
                    WHEN 'AGO' THEN 'AGO'
                    WHEN 'SET' THEN 'SET'
                    WHEN 'OUT' THEN 'OUT'
                    WHEN 'NOV' THEN 'NOV'
                    WHEN 'DEZ' THEN 'DEZ'
                    ELSE 'DESCONHECIDO'
                END`
            ), 'mes_nome'],
            [Sequelize.literal('SUM(ttexe)'), 'total_ttexe'],
            [Sequelize.literal('SUM(ttexe) * 180'), 'total_ttofexe_multiplicado']
        ],
        raw: true,
        group: ['mes_nome', 'ano'],
        order: [
            ['ano', 'ASC'],
            [Sequelize.literal(
                `CASE mes
                    WHEN 'JAN' THEN 1
                    WHEN 'FEV' THEN 2
                    WHEN 'MAR' THEN 3
                    WHEN 'ABR' THEN 4
                    WHEN 'MAI' THEN 5
                    WHEN 'JUN' THEN 6
                    WHEN 'JUL' THEN 7
                    WHEN 'AGO' THEN 8
                    WHEN 'SET' THEN 9
                    WHEN 'OUT' THEN 10
                    WHEN 'NOV' THEN 11
                    WHEN 'DEZ' THEN 12
                    ELSE 13
                END`
            ), 'ASC']
        ]
    });



    // Calculando as diferenças anuais
    let totalCtgeralinicial = 0;
    let totalTtexe = 0;

    total_cotadiaria.forEach(item => {
        totalCtgeralinicial += parseFloat(item.total_ctgeralinicial) || 0;
    });

    total_diariaexe.forEach(item => {
        totalTtexe += parseFloat(item.total_ttexe) || 0;
    });

    const SaldoTtCotaGeral = totalCtgeralinicial - totalTtexe;

    // Combinando e subtraindo dados
    const combineData = total_cotadiaria.map(cotaDistDiaria => {
        // Encontrar o item correspondente em total_cotaexe
        const matchingExe = total_diariaexe.find(exe => exe.mes_nome === cotaDistDiaria.mes_nome && exe.ano === cotaDistDiaria.ano) || {};

        // Calcular as diferenças
        return {
            mes: cotaDistDiaria.mes_nome,
            ano: cotaDistDiaria.ano,
            total_cotadist_diff: (parseFloat(cotaDistDiaria.total_ctgeralinicial) || 0) - (parseFloat(matchingExe.total_ttexe) || 0),
            teto_diaria_inicial: (parseFloat(cotaDistDiaria.total_ctgeralinicial_multiplicado) || 0),
            total_cotadist_multiplicado_diff: (parseFloat(cotaDistDiaria.total_ctgeralinicial_multiplicado) || 0) - (parseFloat(matchingExe.total_ttexe_multiplicado) || 0),
            
        };
    });



        const user = await db.users.findOne({
            attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone', 'createdAt'],
            where: { id: req.user.dataValues.id },
            include: [
                { model: db.omes, as: 'ome', attributes: ['nome'], required: false },
                { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false },
                { model: db.situations, attributes: ['nameSituation'] }
            ],
        });


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
                    return res.render('unidade/unidadeprofile/view', {
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

            
      // Contando usuários
      const countUser = await db.users.count({
          where: { situationId: 1 }
      });

      // Renderizando a página
      return res.render("unidade/dashboard/dashboard", { 
          layout: 'main', 
          profile: req.user.dataValues, 
          dados: combinedData,
          dadoss: combineData,
          pmEscalado,
          eventosFullCalendar: JSON.stringify(eventosFullCalendar),
          data: { countUser, SaldoTtCotaOfGeral, SaldoTtCotaPrcGeral, SaldoTtCotaGeral},
          sidebarDashboard: true 
      });
  } catch (error) {
      console.error("Erro ao buscar dados: ", error);
      res.status(500).send("Erro interno do servidor");
  }
});



// Exportar a instrução que está dentro da constante router 
module.exports = router;

