// You need to complete this controller with the required 7 actions
const viewPath = 'reservations';
const Reservation = require('../models/reservation');
const User = require('../models/user');

const roomTypes = Reservation.schema.paths.roomType.enumValues;
console.log(roomTypes);

exports.index = async (req, res) => {
    try {
        const reservations = await Reservation
            .find()
            .populate('user')
            .sort({ updatedAt: 'desc' });

        res.render(`${viewPath}/index`, {
            pageTitle: 'Main',
            reservations,
            roomTypes
        });
    } catch (err) {
        req.flash('danger', `Sorry something went wrong ${err}`);
        res.redirect('/');
    }
};

exports.show = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('user');
        res.render(`${viewPath}/show`, {
            pageTitle: reservation.title,
            reservation,
            roomTypes
        });
    } catch (err) {
        req.flash('danger', `Something went wrong with the reservation: ${err}`);
        res.redirect('/');
    }
};

exports.new = (req, res) => {
    res.render(`${viewPath}/new`, {
        pageTitle: 'New Reservation',
        roomTypes
    });
};

exports.create = async (req, res) => {
    try {
        const { user: email } = req.session.passport;
        const user = await User.findOne({ email: email });
        const reservation = await Reservation.create({ user: user._id, ...req.body });

        req.flash('success', 'Reservation completed successfully');
        res.redirect(`/reservations/${reservation.id}`);
    } catch (error) {
        req.flash('danger', `Error in creating reservation: ${error}`);
        req.session.formData = req.body;
        res.redirect('/reservations/new');
    }
};

exports.edit = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        res.render(`${viewPath}/edit`, {
            pageTitle: reservation.title,
            formData: reservation,
            roomTypes
        });
    } catch (error) {
        req.flash('danger', `Something went wrong with the reservation: ${error}`);
        res.redirect('/');
    }
};

exports.update = async (req, res) => {
    try {
        const { user: email } = req.session.passport;
        const user = await User.findOne({ email: email });

        let reservation = await Reservation.findById(req.body.id);
        if (!reservation) throw new Error('OOPS! Reservation not found');

        const attributes = { user: user._id, ...req.body };
        await Reservation.validate(attributes);
        await Reservation.findByIdAndUpdate(attributes.id, attributes);

        req.flash('success', 'Reservation was updated successfully');
        res.redirect(`/reservations/${req.body.id}`);
    } catch (error) {
        req.flash('danger', `Error in updating reservation: ${error}`);
        res.redirect(`/reservations/${req.body.id}/edit`);
    }
};

exports.delete = async (req, res) => {
    try {
        console.log(req.body);
        await Reservation.deleteOne({ _id: req.body.id });
        req.flash('success', 'Reservation deleted successfully');
        res.redirect(`/reservations`);
    } catch (error) {
        req.flash('danger', `Error deleting the reservation: ${error}`);
        res.redirect(`/reservations`);
    }
};