const { Router } = require('express');
const { uploadArquivos, listarArquivos } = require('../controllers/arquivoControllers')
const { singleUpload } = require('../connections/multer');
const aws = require('aws-sdk')
const rotas = Router();

rotas.post('/upload', singleUpload("testeUpload"), uploadArquivos)
rotas.get('/', listarArquivos)

module.exports = rotas