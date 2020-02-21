const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
        .populate('user')
        .populate('dishes')
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
        .then((favorite) => {
            const favoriteCount = req.body.length;

            if (favorite != null) {
                for (var i = 0; i < favoriteCount; i++) {
                    const id = req.body[i]._id;

                    if (favorite.dishes.indexOf(id) == -1) {
                        favorite.dishes.push(id);
                    }
                }

                favorite.save()
                .then((savedFavorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(savedFavorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            } else {
                const newFavorite = new Favorites({ user: req.user._id });
                newFavorite.dishes = [];

                for (var i = 0; i < favoriteCount; i++) {
                    const id = req.body[i]._id;

                    if (newFavorite.dishes.indexOf(id) == -1) {
                        newFavorite.dishes.push(id);
                    }
                }

                newFavorite.save()
                .then((savedFavorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(savedFavorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndRemove({ user: req.user._id })
        .then((favorite) => {
            if (favorite != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            } else {
                err = new Error('Favorite not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
        .then((favorite) => {
            if (favorite != null) {
                if (favorite.dishes.indexOf(req.params.dishId) == -1) {
                    favorite.dishes.push(req.params.dishId);
                }

                favorite.save()
                .then((savedFavorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(savedFavorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            } else {
                const newFavorite = new Favorites({ user: req.user._id });
                newFavorite.dishes = [];

                if (newFavorite.dishes.indexOf(req.params.dishId) == -1) {
                    newFavorite.dishes.push(req.params.dishId);
                }

                newFavorite.save()
                .then((savedFavorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(savedFavorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
        .then((favorite) => {
            if (favorite != null) {
                const currentDishIndex = favorite.dishes.indexOf(req.params.dishId);

                if (currentDishIndex > -1) {
                    favorite.dishes.splice(currentDishIndex, 1);

                    favorite.save()
                    .then((savedFavorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(savedFavorite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
                } else {
                    err = new Error('Favorite dish not found');
                    err.status = 404;
                    return next(err);
                }
            } else {
                err = new Error('Favorite not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });

module.exports = favoriteRouter;