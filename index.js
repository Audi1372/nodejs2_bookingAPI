const express = require('express')
const app = express();
app.use(express.json())

app.listen(5000, (req, res) => {
    console.log('server running')
})



const uniqid = require('uniqid')
let rooms = [];
let roomNo = 100;
let bookings = [];
let date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
let time_regex = /^(0[0-9]|1\d|2[0-3])\:(00)/;

app.get('/', (req, res) => {
    res.json({
        output: "homepage"
    })
})

app.get("/rooms", (req, res) => {
    res.json(rooms)
})


app.post("/createRoom", (req, res) => {
    let room = {};
    const { noSeats, amenities, price } = req.body
    room.id = uniqid();
    room.roomNo = roomNo;
    room.bookings = [];
    room.noSeats = noSeats;
    room.amenities = amenities;
    room.price = price
    rooms.push(room);
    roomNo++;
    res.send("room created")
    console.log(rooms)

});



app.get("/getAllBookings", function (req, res) {
    res.json(bookings)
});



app.post("/createBooking", (req, res) => {
    let booking = {};
    let { customerName, date, startTime, endTime } = req.body
    booking.id = uniqid();
    if (customerName) { booking.customerName = req.body.customerName } else { res.status(400).json({ output: 'Please specify customer Name for booking.' }) };
    if (date) {
        if (date_regex.test(date)) {
            booking.date = date
        } else {
            res.status(400).json({ output: 'Please specify date in the format MM/DD/YYYY' })
        }
    } else {
        res.status(400).json({ output: 'Please specify date for booking.' })
    }

    if (startTime) {
        if (time_regex.test(startTime)) {
            booking.startTime = startTime
        } else {
            res.status(400).json({ output: 'Please specify time in hh:min(24-hr format) where minutes should be 00 only' })
        }
    } else {
        res.status(400).json({ output: 'Please specify Starting time for booking.' })
    }

    if (endTime) {
        if (time_regex.test(endTime)) {
            booking.endTime = endTime
        } else {
            res.status(400).json({ output: 'Please specify time in hh:min(24-hr format) where minutes should be 00 only' })
        }
    } else {
        res.status(400).json({ output: 'Please specify Ending time for booking.' })
    }

    const availableRooms = rooms.filter(room => {
        if (room.bookings.length == 0) {
            return true;
        } else {
            room.bookings.filter(book => {
                if ((book.date == date)) {
                    if ((parseInt((book.startTime).substring(0, 1)) > parseInt((startTime).substring(0, 1))) &&
                        (parseInt((book.startTime).substring(0, 1)) > parseInt((endTime).substring(0, 1)))) {
                        if ((parseInt((book.startTime).substring(0, 1)) < parseInt((startTime).substring(0, 1))) &&
                            (parseInt((book.startTime).substring(0, 1)) < parseInt((endTime).substring(0, 1)))) {
                            return true;
                        }
                    }
                }
                else {
                    return true;
                }
            })

        }
    });
    if (availableRooms.length == 0) { res.status(400).json({ output: 'No Available Rooms on Selected Date and Time' }) }
    else {
        roomRec = availableRooms[0];
        let count = 0;
        rooms.forEach(element => {
            if (element.roomNo == roomRec.roomNo) {
                rooms[count].bookings.push({
                    customerName: customerName,
                    startTime: startTime,
                    endTime: endTime,
                    date: date
                })
            }
            count++;
        });
        let bookingRec = req.body;
        bookingRec.roomNo = roomRec.roomNo;
        bookingRec.cost = parseInt(roomRec.price) * (parseInt((bookingRec.endTime).substring(0, 1)) - parseInt((bookingRec.startTime).substring(0, 1)));


        bookings.push(bookingRec);
        res.status(200).json({ output: 'Room Booking Successfully' })
    }
});


