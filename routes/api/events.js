const { createEvent } = require('ics');
const express = require('express');
const router = express.Router();
const controller = require(''../controllers/eventsController');
const db = reeequire('../db');

//create event
router.post('/', controller.createEvent);

//share event
router.post('/:eventId/share', controller.shareEvent);

//get all events for user
router.get('/user/:userId', controller.getUserEvents);

//send app cal event to personal cal
router.get('/:eventId/ics', async (req, res) => {
    const { eventId } = req.params;

    try {
        const result = await db.query('Select * FROM events WHERE id = $1', [eventId]);
        const event = result.rows[0];

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const date = new Date(event.time);
        const icsEvent = {
            start: [
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate(),
                date.getHours(),
                date.getMinutes()
            ],
            duration: {hours: 1},
            title: event.event_type,
            description: event.notes || '',
            location: event.location || '',
        };
        createEvent(icsEvent, (error, value) => {
            if (error) return res.status(500).json({ error });

            res.setHeader('Content-Disposition', 'attachment; filename=-${event.id}.ics');
            res.setHeader('Content-Type', 'text/calendar');
            res.send(value);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
