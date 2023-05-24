require('dotenv').config();
const multer = require('../connections/multer');
const aws = require('aws-sdk');


const endpoint = new aws.Endpoint(process.env.ENDPOINT_S3);

const s3 = new aws.S3({
    endpoint,
    credentials: {
        accessKeyId: process.env.KEY_ID,
        accessKeyId: process.env.KEY_ID,
        secretAccessKey: process.env.APP_KEY
    }
})


const uploadArquivos = async (req, res) => {
    const { file } = req

    if (!file) {
        return res.status(400).json({ mensagem: `É obrigatório o envio de um arquivo de imagem.` })
    }

    const nomeFormatado = file.originalname.replaceAll(" ", "-")
    const nomeDaImagem = `produtos/imagem/${new Date().getTime()}.${nomeFormatado}`

    try {
        const arquivo = await s3.upload({
            Bucket: process.env.BACKBLAZE_BUKET,
            Key: nomeDaImagem,
            Body: file.buffer,
            ContentType: file.mimetype
        }).promise()
        console.log(arquivo);

        return res.status(200).json({
            url: arquivo.Location,
            path: arquivo.Key
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: `Erro interno do servidor ${error.message}` });
    }
}

const listarArquivos = async (req, res) => {
    
    try {
        const arquivos = await s3.listObjects({
            Bucket: process.env.BACKBLAZE_BUKET
        }).promise()

        const files = arquivos.Contents.map((file) => {
            return {
                url: `https://${process.env.BACKBLAZE_BUKET}.${process.env.ENDPOINT_S3}/${file.Key}`,
                path: file.Key
            }
        })

        return res.status(200).json(files)
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro interno do servidor ${error.message}` })
    }
}

module.exports = {
    uploadArquivos,
    listarArquivos,
    s3
}
