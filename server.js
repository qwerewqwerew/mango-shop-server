const express = require("express"); //express 불러오기
const cors = require("cors"); //cors 불러오기
const app = express(); //불러온 express 실행
const models = require("./models");
const multer = require("multer");
const upload = multer({
	storage: multer.diskStorage({
	  destination: function (req, file, cb) {
		cb(null, "uploads/");
	  },
	  filename: function (req, file, cb) {
		cb(null, file.originalname);
	  },
	}),
  });
const port = 8080;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

//banner api
app.get('/banners',(req,res)=>{
	models.Banner.findAll({
		limit: 2,	
	  })
		.then((result) => {
		  res.send({
			banners: result,
		  });
		})
		.catch((error) => {
		  console.error(error);
		  res.status(500).send("에러가 발생했습니다");
		});
})

app.get("/products", (req, res) => {
	models.Product.findAll({
		order: [["createdAt", "DESC"]],
		attributes: ["id", "name", "price", "seller", "createdAt","imageUrl","soldout"],
	})
		.then((result) => {
			console.log("PRODUCTS : ", result);
			res.send({
				products: result,
			});
		})
		.catch((error) => {
			console.error(error);
			res.status(400).send("에러 발생");
		});
});

//app에 post 방식 사용시 요청,응답
app.post("/products", (req, res) => {
	const body = req.body;
	const {name, description, price, seller, imageUrl} = body;
	models.Product.create({
		name,
		description,
		price,
		seller,
		imageUrl,
	})
		.then((result) => {
			console.log("상품생성결과:", result);
			res.send({
				result,
			});
		})
		.catch((error) => {
			console.error(error);
			res.status(400).send("상품 업로드에 문제가 발생했습니다.");
		});
});

app.get("/products/:id", (req, res) => {
	const params = req.params;
	const {id} = params;
	//단일상품조회는 findOne
	models.Product.findOne({
		//조건문 where 사용 => id가 상수 id와 같은것
		where: {
			id: id,
		},
	})
		.then((result) => {
			console.log("prodcut:", result);
			res.send({
				product: result,
			});
		})
		.catch((error) => {
			console.error();
			res.send("상품조회시 에러가 발생했습니다.");
		});
});

app.post('/image',upload.single('image'),(req,res)=>{
	const file=req.file;
	console.log(file);
	res.send({
		imageUrl:file.path,
	})
})

app.post("/purchase/:id", (req, res) => {
	const { id } = req.params;
	models.Product.update(
	  {
		soldout: 1,
	  },
	  {
		where: {
		  id,
		},
	  }
	)
	  .then((result) => {
		res.send({
		  result: true,
		});
	  })
	  .catch((error) => {
		console.error(error);
		res.status(500).send("에러가 발생했습니다.");
	  });
  });
  
app.listen(port, () => {
	console.log("망고샵의 서버가 구동되고 있습니다");
	models.sequelize
		.sync()
		.then(() => {
			console.log("✓ DB 연결 성공");
		})
		.catch(function (err) {
			console.error(err);
			console.log("✗ DB 연결 에러");
			process.exit();
		});
});
