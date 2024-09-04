import "dotenv/config";
import express from "express";
import path from "path";
import session from "express-session";

import router from "./router/index.routes.js";

const app = express();

const PORT = process.env.LOCAL_PORT;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/views"));

app.use("/css", express.static(path.join(process.cwd(), "public/css")));
app.use("/img", express.static(path.join(process.cwd(), "public/img")));

// Configuration du middleware de session

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET, 
        // secret : paramètre obligatoire 
        // => clé secrète utilisée pour signer le cookie de session (utilisée pour générer une signature de hachage)
    resave: false,
        // resave : contrôle si la session doit être sauvegardée même si elle n'a pas été modifiée
        // => avec false : on améliore les performances en évitant les sauvegardes inutiles
    saveUninitialized: false,
        // saveUnintialized : détermine si une session non initialisée doit être sauvegardée 
        // session dite non initialisée : nouvelle session sans aucune donnée enregistrée
        // => avec false : on améliore les performances en évitant les sauvegardes inutiles
    cookie: { secure: false, httpOnly: true, maxAge: 259200000 }
        // cookie : objet de configuration pour le cookie de session 
        // => permet d'identiter le client lors de ses requêtes
    
    // secure : paramètre déterminant si le cookie doit être transmis uniquement via des http sécurisés
    // => false : le cookie peut être envoyé sur des connexions non sécurisées (http)

    // httpOnly : paramètre déterminant si le cookie peut être accédé uniquement par le serveur ou via le JS côté client
    // => true : le cookie ne peut pas être accédé ou modifié via le JS (accessible que via le serveur)
    
    // sameSite :
    // - strict : le cookie n'est envoyé qu'avec des requêtes provenant du même site
    // - lax : le cookie est envoyé si l'utilisateur navigue sur le domaine ou si c'est un lien externe
    // - none : le cookie est envoyé dans tous les cas (y compris les requêtes initiées par d'autres sites)

    // maxAge : paramètre spécifiant la durée de vie du cookie en ms
}));

app.use(express.urlencoded({ extended: false }));

// Middleware de traitement intermédiaire
// => il va préparer les données (`username`, `isLogged`) pour les rendre accessibles 

app.use((req, res, next) => {
    console.log(req.session);

    const username = req.session.isLogged ? req.session.user.username : "Guest";
    // opérateur ternaire pour déterminer la valeur de la variable username en fct de l'état de connexion du user
    // => req.session.isLooged : vérifie si le user est connecté (truthy)
    // => req.session.user.username :
    // - si truthy, le username est extrait de l'objet user 
    // - si falsy, la variable username prend la valeur "guest"

    res.locals.username = username;
    // assignation de la valeur username à res.locals
    // res.locals : objet (fourni par Express) pour partager des données entre les middlewares et les vues

    res.locals.isLogged = req.session.isLogged;
    
    next();
    // next() : permet à la requête de continuer son chemin après que cet middlewear a terminé de préparer les données 
    // => sans next(), la requête resterait bloquée à ce niveau
});


app.use(router);

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));