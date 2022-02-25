const server = require("express")();
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
require("dotenv").config();
const Schema = mongoose.Schema;

// Connect Database
const DB = process.env.DB_URL || "mongodb://localhost:27017/mongoosequery";
const db=mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    })
    .then((data) => {
    console.log(`Mongodb connected with server : ${data.connection.host}`)
    })
    .catch((err)=> console.log(err));



    // for aggragation
const pizzaSchema = new Schema({
    name: String,
    size: String,
    price:Number,
    quantity:Number,
})


// Making Student Schema
const studentSchema = new Schema({
    name: { type:String, unique:true},
    age:Number,
    subject: String,
})

const classSchema = new Schema({
    name: { type:String, unique:true},
    students:[{ type:"ObjectId",ref:"Student"}],
    subject: String,
})






const Student = new mongoose.model("Student",studentSchema);
const Class = new mongoose.model("Class",classSchema);
const Pizza = new mongoose.model("Pizza",pizzaSchema);


// Middleware
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended:true}));

// Pizza API
server.post("/pizza", async(req,res)=>{
    
    await Pizza.syncIndexes();
    let pizza = new Pizza();
    pizza.name = req.body.name;
    pizza.size = req.body.size;
    pizza.price = req.body.price;
    pizza.quantity = req.body.quantity;

    pizza.save((err)=>{
        if(err) res.json({"error":err});
        else  res.json({pizza});
    });

    // res.json(pizza);
})

server.get("/pizza",async(req,res)=>{
    // let pizza = await Pizza.aggregate().match({price:{$gte:15}})
    // let pizza = await Pizza.aggregate().match({size: "medium"})
    let pizza = await Pizza.aggregate()
    .match({size: "medium"})
    .group({ _id: "$name", totalQuantity: { $sum: "$quantity" } ,totalOrderValue:{ $sum: { $multiply: [ "$price", "$quantity" ] } }, averageOrderQuantity: { $avg: "$quantity" }})
    .sort("-totalQuantity")

    res.json(pizza)
})



// Class API

server.get("/class",(req,res)=>{

    // get all
    // Class.find().exec((err,docs)=>{
    //          if (err) throw(err)
    //          res.json(docs)
    // })

    Class.find().populate("students").exec((err,docs)=>{
        if (err) throw(err)
        res.json(docs)
    })
})

server.post("/class", (req,res)=>{
    
    let cl = new Class();
    cl.name = req.body.name;
    cl.students = [];

    cl.save((err)=>{
        if(err) res.json({"error":err});
        else  res.json({cl});
    });

    // res.json(student);
})

server.put("/class/:id",(req,res)=>{

    Class.findOneAndUpdate({_id: req.params.id},{$push:{students:req.body.studentId}},{new:true},(err,docs)=>{
        if (err) throw(err)
        else res.json(docs)
    })
})






// Students API
server.get("/students",(req,res)=>{

    // $gt  means Greater then
    // Student.find({age:{$gt:20}},(err,docs)=>{
    //     if (err) throw(err)
    //     res.json(docs)
    // })

    // lte = less then equal
    // Student.find({age:{$lte:req.query.age}},(err,docs)=>{
    //     if (err) throw(err)
    //     res.json(docs)
    // })

    // all data
    // Student.find({},(err,docs)=>{
    //     if (err) throw(err)
    //     else res.json(docs)
    // })

     // all data
    //  Student.find({}).exec((err,docs)=>{
    //     if (err) throw(err)
    //     else res.json(docs)
    // })

    // all data sorted ascending
    // Student.find({}).sort("age").exec((err,docs)=>{
    //     if (err) throw(err)
    //     else res.json(docs)
    // })

     // all data sorted descending
    //  Student.find({}).sort("-age").exec((err,docs)=>{
    //     if (err) throw(err)
    //     else res.json(docs)
    // })

    // all data  age sorted descending n name sorted
    // Student.find({}).sort("age name").exec((err,docs)=>{
    //     if (err) throw(err)
    //     else res.json(docs)
    // })

    // all data  age sorted descending n name sorted n show only 3
    // Student.find({}).sort("age name").limit(3).exec((err,docs)=>{
    //     if (err) throw(err)
    //     else res.json(docs)
    // })

    // skip start 2 data
    // all data  age sorted descending n name sorted n show only 3
    // Student.find({}).sort("age name").skip(2).limit(3).exec((err,docs)=>{
    //     if (err) throw(err)
    //     else res.json(docs)
    // })

    // Return diffrent name or distinct name
    Student.find({}).distinct("name").exec((err,docs)=>{
        if (err) throw(err)
        else res.json(docs)
    })


})

server.get("/students/:id",(req,res)=>{
    // $gt  means Greater then
    // Student.find({age:{$gt:20}},(err,docs)=>{
    //     if (err) throw(err)
    //     res.json(docs)
    // })
    Student.findOne({_id: req.params.id},(err,docs)=>{
        if (err) throw(err)
        res.json(docs)
    })
})


server.put("/students/:id",(req,res)=>{

    Student.findOneAndUpdate({_id: req.params.id},{$set:{age:req.body.age}},{new:true},(err,docs)=>{
        if (err) throw(err)
        else res.json(docs)
    })
})

server.delete("/students/:id",(req,res)=>{

    Student.findByIdAndRemove(req.params.id,(err,docs)=>{
        if (err) throw(err)
        else res.json(docs)
    })
})


server.post("/students", (req,res)=>{
    
    let student = new Student();
    student.name = req.body.name;
    student.age = req.body.age;
    student.subject = req.body.subject;

    student.save((err)=>{
        if(err) res.json({"error":err});
        else  res.json({student});
    });

    // res.json(student);
})


// Server Listening
const port = 8000
server.listen(port,()=>{
    console.log(`Server Running on port: ${port}`);
})