const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
const { render } = require("ejs");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

mongoose.set('strictQuery', true);

// let items = [];

// let WorkItems = [];

// let RecreationItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema =  new mongoose.Schema({
    name: String,
    rate: String
  });

  const Item = mongoose.model("Item", itemsSchema);

  const item1 = new Item({
    
    name:"Start",
  });

const defaultItems = [item1];

const listSchema = {
    name : String,
    item : [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    
    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
        if(err){
            console.log(err);
        } else {
            console.log("Successfully saved our default items to our DB.");
        }

    });
    res.redirect("/");
    } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
        });

    });

    // app.get("/Work", function(req, res){
    //     res.render("list", {listTitle: "Work List", newListItems: WorkItems});
    // });

    app.get("/:customListName", function(req, res){
        const customListName = _.capitalize(req.params.customListName);

        List.findOne({name: customListName}, function(err, foundList){
            if(!err){
                if(!foundList){

        //create new list
        const list = new List({
            name: customListName,
            item: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
                } else {
                   
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.item});
                }
            }
            });

        });

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
        } else {
        List.findOne({name: listName}, function(err, foundList){
            console.log(foundList.item);
        foundList.item.push(item);
        foundList.save();
        res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName ==="Today"){
        
    Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
            console.log("Successfully deleted the selected item.");
            res.redirect("/");
        }
        });
    } else {
        List.findOneAndDelete({name: listName}, {$pull:{items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
            res.redirect("/" + listName);
        }
        });
    }
});

app.listen(3000, function(){
    console.log("Server is running on port 3000.");
}); 
