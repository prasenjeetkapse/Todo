//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _  =require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connnect to MongoDB
run().catch(err => console.log(err));
async function run(){
    await mongoose.connect('mongodb+srv://prasenjeet:kapse@cluster0.khrsixr.mongodb.net/todolistDB');
    
    const itemSchema = {
      name:String
    };

    const Item = mongoose.model("Item", itemSchema);

    const item1 = new Item({
      name : "Welcome to your todo list!"
    });
    const item2 = new Item({
      name : "Hit the + button to add item"
    });
    const item3 = new Item({
      name : "<-----Hit this to delete an item."
    });

    const defaultItems = [item1,item2,item3];
    
    const listSchema = {
      name:String,
      items:[itemSchema]
    }

    const List = mongoose.model("List", listSchema);

  app.get("/", function(req, res) {

    Item.find().then(function(foundItems){
      if(foundItems.length==0){
        Item.insertMany(defaultItems).then(function(){
        //console.log("Succecefully saved default items into DB!")
        });
        res.redirect("/");
      }else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
     
    });
    //res.render("list", {listTitle: Today, newListItems: items});

  });

  app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name:itemName
    });

    if(listName=="Today"){
      item.save();
      res.redirect('/');
    }
    else{
      List.findOne({name:listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
    }
    
  });

  app.post("/delete", function(req,res){
    const checkedItemId  = req.body.checkbox;
    const listName = req.body.listName;

    if(listName=="Today"){
      Item.findByIdAndRemove(checkedItemId).then(function(){
        //console.log("Succesfully deleted an Item!")
      });
      res.redirect("/");
    }
    else{
      List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedItemId}}}).then(function(foundList){
        res.redirect("/"+listName);
      })
    }
    
  })

  app.get("/:customeListName", function(req,res){
    const customeListName = _.capitalize(req.params.customeListName);

    List.findOne({name:customeListName}).then(function(foundList){
          
            if(!foundList){
               const list = new List({
                name:customeListName,
                items:defaultItems
              })
              list.save();
              res.redirect("/"+customeListName);
            }
          else{
            
            res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
          }
      
      });
    

    
  });

  app.get("/about", function(req, res){
    res.render("about");
  });

  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });


}