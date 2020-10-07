module.exports = (app, urlDB) => {
	const path = require("path");
	const { customAlphabet } = require("nanoid");
	const yup = require("yup");
	const rateLimit = require('express-rate-limit');

	let urlRegEx = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
	const schema = yup.object().shape({
		slug: yup.string().trim().matches(/^[\w\-]+$/i, "Only lowercase letters, numbers, dashes and underscores."),
		url: yup.string().trim().matches(urlRegEx, "URL is not valid.").required("URL is required.")
	});
	
	const notFound = path.join(__dirname, "..", "public", "404.html");
	
	urlDB.createIndex({ slug: 1 }, { unique: true });

	app.get("/u/:slug", async (req, res, next) => {
		let { slug } = req.params;
		try {
			let result = await urlDB.findOne({ slug });
			if (result) {
				if (!result.url.includes("http")) {
					result.url = "https://" + result.url;
				}
				res.redirect(result.url);
			} else {
				res.status(404).sendFile(notFound);
			}
		} catch (err) {
			next(err)
		}
	});
	
	let rate = 10;

	app.post("/u", rateLimit({
		windowMs: rate * 1000,
		max: 2,
		message: {message: `Slow down buddy, try again in ${rate} seconds.`}
	}), async (req, res, next) => {
		let { slug, url } = req.body;
		try {
			await schema.validate({
				slug,
				url,
			});
			if (!slug) {
				slug = customAlphabet("abcdefghijklmnopqrstuvwxyz", 5)();
			} else {
				slug = slug.toLowerCase();
				let existing = await urlDB.findOne({ slug });
				if (existing) {
					throw new Error("In use.");
				}
				if (url.includes(`berkeozgen.me/u/${slug}`)) {
					throw new Error("Loop detected.");
				}
			}
			urlDB.insert({
				slug,
				url,
				time: Date.now()
			});
			res.json({
				message: `berkeozgen.me/u/${slug}`
			});
		} catch (err) {
			next(err);
		}
	});
};