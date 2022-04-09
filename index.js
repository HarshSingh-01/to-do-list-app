const express = require("express");
const { reset } = require("nodemon");
const bodyParser = require("body-parser");
const _ = require('lodash');

const mongoose = require('mongoose');
const { mainModule } = require('process');
main().catch(err => console.log(err));

async function main (){
    await mongoose.connect('mongodb+srv://admin-harsh:Test1234@cluster0.8yic0.mongodb.net/toDoListDB');
};

const date = require(__dirname + "/date.js");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
 
const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model('List',listSchema);

const item1 = new Item({
    name: "Welcome to your to do list!"
});

const item2 = new Item({
    name: "Hit + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


let itemArray = ["Buy food", "Cook food", "Eat food"];
let workItemArray = [];

app.get("/", (req,res) => {
    let day =  date.getDay();
    // res.render("list", {listTitle: "Today", items: itemArray});
    Item.find({},function(err,items){
        if (items.length===0) {
            Item.insertMany(defaultItems, function(err){
            if (err){
                console.log(err);
            } else{
                console.log('Successfully added');
            }   
        });
        res.redirect("/");
        }else {
            res.render("list", {listTitle: "Today", items: items});
        }
    });
});

app.get('/:customListName', (req, res)=>{
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName}, function(err, foundList){
        if (!err){
            if (!foundList){
                // Creating a new list.
                const list =  new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect('/' + customListName);
            }else{
                // Rendering existing list.
                res.render("list", {listTitle: foundList.name, items: foundList.items});
            }
           
        }
    })
    
});

app.post("/", (req,res)=>{
    const item = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
        name: item
    });

    if (listName=="Today"){
        newItem.save();
        res.redirect('/')
    }else{
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect('/'+listName);
        })
    }
});

app.post("/delete", (req, res)=>{

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName==="Today"){   
    Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
            console.log("Successfully removed");
        }
    });
    res.redirect('/');
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect('/'+listName);
            }
        })
    }

});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is started successfully.")
});