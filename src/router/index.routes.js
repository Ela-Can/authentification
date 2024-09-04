import express from "express";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

import { home, login, register } from "../controller/view.js";

const router = express.Router();

router.get("/", home);


///////////////// Gestion de l'enregistrement d'un user /////////////////

router.get("/register", register);

// async et await : permet la gestion des opérations asynchrones

// ici async déclare la fonction asynchrone 
// attention, await ne peut être utilisé que dans une fonction asynchrone
// => il permet de suspendre l'exécution de la fonction jusqu'à ce que la promesse soit résolue

router.post("/register", async (req, res) => {

    // on vérifie sur l'utilisateur existe déjà 
    const q = "SELECT id, username, password FROM `user` WHERE username = ?";
    const [[user]] = await pool.execute(q, [req.body.username]);

    if (req.body.username.length > 2 && req.body.password.length > 2) {

        const hash = await bcrypt.hash(req.body.password, 10);
        // => avec await : on demande à cette ligne d'attendre que le hachage se termine pour continuer

       
        const q = "INSERT INTO user (username, password) VALUES (?, ?)";
        // préparation de la requête

        await pool.execute(q, [req.body.username, hash]);
        // exécution de la requête SQL
        // => avec await, on garantit que la requête soit terminée pour rediriger l'utilisateur

        res.redirect("/login");
        return;
    }
    
    res.redirect("/register") // redirection vers la page "register" si les conditions ne sont pas remplies
})



///////////////// Gestion de la connexion d'un user /////////////////

router.get("/login", login);

router.post("/login", async (req, res ) => {
    // préparation de la requête SQL afin de vérifier si l'utilisateur existe
    const q = "SELECT id, username, password FROM `user` WHERE username = ?";
    const [[user]] = await pool.execute(q, [req.body.username]);
    // => ici on a une destructuration double pour extraire les résultats dans ula variable user

    if(user){ 
        const same = await bcrypt.compare(req.body.password, user.password);
        // => méthode compare : renvoie true si le password est correct ou sinon false

        if(same){ 
            req.session.user = req.body;
            // création d'une session utilisateur (= stockage des infos) dans l'objet session 

            req.session.isLogged = true;
            // indicateur permettant de savoir si l'utilisateur est connecté ou non 

            res.redirect("/");
            return;
        }
    }
    // si aucun utilisateur n'est trouvé ou si les mots de passe ne correspondent pas
    console.log("MAUVAIS IDENTIFIANT(S) NOUVEL ESSAI"); // juste pour nous dans le terminal !!
    res.redirect("/login");
    // => on redirige vers le formulaire de login pour qu'il retente sa chance
});



///////////////// Gestion de la déconnexion d'un user /////////////////

router.get("/", (req, res) => {
    req.session.destroy(() => { // permet de détruire la session active de l'utilisateur (toutes les données stockées seront supprimées)
        req.session = null; // assure que l'objet de session sera supprimé après avoir été détruit 
        res.clearCookie("connect.sid"); // efface le cookie de session par défaut
        // => le cookie de session par défaut est nommé connect.sid
        res.redirect("/");
    })
});

export default router;