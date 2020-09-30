module.exports = (app, snakeDB) => {
	const yup = require("yup");
	const schema = yup.object().shape({
		name: yup.string().trim().matches(/^[a-z0-9]{3}$/gi).required(),
		score: yup.number().min(2).required()
	});

	app.post("/snake/api", async (req, res, next) => {
		try {
			let { name, score } = req.body;
			await schema.validate({
				name,
				score
			});
			let time = Date.now();
			let data = {name, score, time};
			snakeDB.insert(data);
			res.json(data);
		} catch (err) {
			next(err);
		}
	});
	
	app.get("/snake/api", (req, res, next) => {
		snakeDB.find()
			.catch(err => {
				res.sendStatus(500);
				next(err);
			})
			.then((data) => {
				for(i of data) {
					delete i.time;
					delete i._id;
				}
				
				data.sort((a, b) => {
					return b.score - a.score;
				});
	
				let x = data.length;
				if(data.length > 9){
					x = 9;
				}
	
				temp = [];
	
				for(let i = 0; i < x; i++) {
					temp[i] = data[i];
				}
	
				res.json(temp);
			});
	});
	
	app.get("/snake/db", (req, res, next) => {
		snakeDB.find()
			.catch(err => {
				res.sendStatus(500);
				next(err);
			})
			.then((data) => {
				data.sort((a, b) => {
					return b.time - a.time;
				});
	
				for(i of data) {
					delete i._id;
					i.time = new Date(i.time).toString();
				}
				
				res.json(data);
			})
	});
	
	app.get("/snake/names", (req, res, next) => {
		snakeDB.find()
			.catch(err => {
				res.sendStatus(500);
				next(err);
			})
			.then((data) => {
				let names = [];
				for (let i of data) { 
					if (!names.includes(i.name)) {
						names.push(i.name);
					}
				}
				let length = names.length;
				res.json({names, length});
			})
	});
};