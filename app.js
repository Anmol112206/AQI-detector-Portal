import express from "express";
const app = express();
app.use(express.static("public"));

const PORT = 5000;

app.get("/home", async (req, res) => {
  res.render("listings/home.ejs");
});
app.get("/search_aqi", async (req, res) => {
  res.render("listings/search_aqi.ejs");
});
app.get("/manage_city", async (req, res) => {
  res.render("listings/manage_city.ejs");
});
app.get("/about", async (req, res) => {
  res.render("listings/about.ejs");
});
app.get("/favicon.ico", async () => {});
app.get("/resources", async (req, res) => {
  res.render("listings/resources.ejs");
});
app.get("/login", async (req, res) => {
  res.render("listings/login.ejs");
});
app.get("/signup", async (req, res) => {
  res.render("listings/signup.ejs");
});
app.get("/map", async (req, res) => {
  res.render("listings/map.ejs");
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
