const { poolQuery } = require('../connections/conexao');
const { s3 } = require('./produtoControllers');

const cadastrarProduto = async (req, res) => {
    const { descricao, quantidade_estoque, valor, categoria_id, produto_imagem } = req.body

    try {
        const insert = "INSERT INTO produtos (descricao, quantidade_estoque, valor, categoria_id, produto_imagem) VALUES ($1, $2, $3, $4, $5) RETURNING *"

        const resultado = await poolQuery(insert, [descricao, quantidade_estoque, valor, categoria_id, produto_imagem])

        if (!resultado.rowCount) {
            return res.status(400).json({ mensagem: "Não foi possível cadastrar o produto" })
        }

        const produtoCadastrado = resultado.rows[0]

        return res.status(201).json(produtoCadastrado)
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro do servidor ${error.message}` })
    }
}

const editarDadosProduto = async (req, res) => {
    const { id } = req.params
    const { descricao, quantidade_estoque, valor, categoria_id, produto_imagem } = req.body
    

/* - Caso exista uma imagem vinculada a esse produto, a imagem vinculada anteriormente deverá
 ser excluída no servidor de armazenamento e substituída pela nova imagem.
- Caso exista uma imagem vinculada a esse produto, e o campo `produto_imagem` de atualização 
possuir valor `null`deverá ser excluída a imagem vinculada anteriormente e o valor `null` 
será atribuído a coluna 
`produto_imagem` deixando o produto sem imagem vinculada.*/

    try {
     if(!produto_imagem ){

        const select = "SELECT * FROM produtos WHERE id = $1"
        const resultado = await poolQuery(select, [id])

        const url = resultado.rows[0].produto_imagem

        if (url) {

            const path = url.split(`${process.env.BACKBLAZE_BUCKET}/`)

            const keyPath = path.slice(1).join()

            await s3.deleteObject({
                Bucket: process.env.BACKBLAZE_BUCKET,
                Key: keyPath
            }).promise()
        
        }

     }
        
        const update = "UPDATE produtos SET descricao = $1, quantidade_estoque = $2, valor = $3, categoria_id = $4, produto_imagem = $5 WHERE id = $6 RETURNING *"
        
        const resultado = await poolQuery(update, [descricao, quantidade_estoque, valor, categoria_id,produto_imagem, id])

        if (!resultado.rowCount) {
            return res.status(400).json({ mensagem: "Não foi possível editar os dados deste produto" })
        }

        

        const dadosProduto = resultado.rows[0]

        return res.status(200).json(dadosProduto)
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro do servidor ${error.message}` })
    }
}

const listarProdutos = async (req, res) => {
    const { categoria_id } = req.query

    try {
        if (!categoria_id) {
            const resultado = await poolQuery("SELECT * FROM produtos")

            if (!resultado.rowCount) {
                return res.status(404).json({ mensagem: "Não há produtos cadastrados" })
            }

            return res.status(200).json(resultado.rows)
        }

        const select = "SELECT * FROM produtos WHERE produtos.categoria_id = $1"
        const resultado = await poolQuery(select, [categoria_id])

        if (!resultado.rowCount) {
            return res.status(404).json({ mensagem: "Não há produtos vinculados a categoria informada" })
        }

        return res.status(200).json(resultado.rows)
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro do servidor ${error.message}` })
    }
}

const detalharProduto = async (req, res) => {
    const { id } = req.params

    try {
        const select = "SELECT * FROM produtos WHERE id = $1"
        const resultado = await poolQuery(select, [id])

        const dadosProduto = resultado.rows[0]

        return res.status(200).json(dadosProduto)
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro do servidor ${error.message}` })
    }
}

const excluirProduto = async (req, res) => {
    const { id } = req.params

    try {
        const select = "SELECT * FROM produtos WHERE id = $1"
        const resultado = await poolQuery(select, [id])
       

        const url = resultado.rows[0].produto_imagem

        if (url) {
        const url = resultado.rows[0].produto_imagem

        if (url) {

            const path = url.split(`${process.env.BACKBLAZE_BUCKET}/`)

            const keyPath = path.slice(1).join()

            await s3.deleteObject({
                Bucket: process.env.BACKBLAZE_BUCKET,
                Key: keyPath
            }).promise()
        }
        }
        return res.status(200).json({ mesagem: "Produto excluído" })
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro do servidor ${error.message}` })
    }
}

module.exports = {
    cadastrarProduto,
    editarDadosProduto,
    listarProdutos,
    detalharProduto,
    excluirProduto
}