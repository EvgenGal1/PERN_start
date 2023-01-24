// fn|запросы по созданию постов для польз.

// подкл.конфиг.БД для записи получ.данн.в БД
// const db = require("../db");
const { pool } = require("../db");

// обьяв.кл.(для компановки) с неск.мтд
class PostControllers {
  // async созд.поста по SQL запросу ВСТАВКИ, проверки
  async createPost(req, res) {
    // базов.логика с обраб.ошб.
    try {
      // return res.json(["123"]);
      // получ.данн.с fronta
      const { title, content, picture, userId } = req.body;
      // async созд.поста с пропис.SQL запросом
      const newPost = await pool.query(
        `INSERT INTO post (title, content, picture, userId) VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, content, picture, userId]
      );
      // возвращ.только пост(rows) на front
      res.json(newPost.rows[0]);
    } catch (error) {
      const { title, content, picture, userId } = req.body;
      // общ.отв. на серв.ошб. в json смс
      res.status(500).json({
        // , ${password}
        message: `Не удалось добавить Пост - ${title}. ${content}, ${userId}`,
      });
    }
  }

  // async возрат поста по ID польз. в SQL запросе
  async getPostById(req, res) {
    try {
      // ID получ.из query(не params). Это не часть стр.запроса, а отдел.query парам. указывающийся после вопрос.знака в адресе/пути Postman|Брайзер (http://localhost:5005/PERN/post?id=5)
      // const id = req.query.id;
      const { id, userId } = req.query;
      var varId;
      if (id) {
        var varId = await pool.query(`SELECT * FROM post WHERE id = $1`, [id]);
      } else if (userId) {
        var varId = await pool.query(`SELECT * FROM post WHERE userId = $1`, [
          userId,
        ]);
      }
      // возвращ. весь массив (по факту только по id)
      res.json(varId.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // ! НЕ РАБ - выгружает только пустой объ.
  async getAllPost(req, res, next) {
    try {
      // return res.json(["123"]);
      const def = "*";
      const post = await pool.query(`SELECT * FROM post RETURNING *`);
      // const post = await pool.query(`SELECT $def FROM post`, [def]);
      return res.json(post);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getOnePost(req, res, next) {
    try {
      const { id, userId } = req.params;
      var onePost = await pool.query(`SELECT * FROM post WHERE id = $1`, [id]);
      // ! не раб условие. Е/и Поста нет возвращ.пустой массив
      if (
        onePost === "" ||
        onePost.length == 0 ||
        onePost === [] ||
        onePost === {}
      ) {
        return res.json({ message: "ID не найден" });
      }
      return res.json(onePost.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updPost(req, res, next) {
    try {
      const post = req.body;
      if (!post.id) {
        res.status(400).json({ message: "ID не указан" });
      }
      const updPost = await pool.query(
        // ^ ОБНОВЛЕНИЕ табл. ПОСТАВИТЬ столб = 'будет' ГДЕ столб = 'было';
        `UPDATE post SET title = $2 WHERE id = $1 RETURNING *`,
        [post.id, post.title /* , content, picture, userId */]
      );
      return res.json(updPost.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async delPost(req, res, next) {
    try {
      const { id } = req.params;
      const delPost = await pool.query(
        // DELETE FROM post WHERE id = 9;
        `DELETE FROM post WHERE id = $1 RETURNING *`,
        [id /*, post.title  , content, picture, userId */]
      );
      return res.json({ message: `Удалён`, del: delPost.rows });
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

// экспорт объ.кл.
module.exports = new PostControllers();
