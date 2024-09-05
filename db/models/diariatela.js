// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class diariatela extends Model {
    
  }

  diariatela.init({
    valorliberado: DataTypes.STRING,
    ttcotaconsumida: DataTypes.STRING,
    ttsaldo: DataTypes.STRING,
    mes: DataTypes.STRING,
    ano: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'diariatela',
  });

  
  return diariatela;
};