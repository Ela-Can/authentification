
const home = (req, res) => {
    res.render("home");
}

const login = (req, res) => {
    res.render("login");
}

const register = (req, res) => {
    res.render("register");
}

export { home, login, register } ;
