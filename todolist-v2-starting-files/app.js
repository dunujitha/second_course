//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://dunu:kusumavathi@cluster0.h0kbpyv.mongodb.net/todolistDB', {useNewUrlParser: true});


const itemsSchema = {
  name: String
}

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Welcome to your todolist'
});

const item2 = new Item({
  name: 'Hit the + button to add a new item'
});

const item3 = new Item({
  name: 'Hit this to delete an item'
})


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};


const List = mongoose.model('List', listSchema);


app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
       console.log('Sucessfully added')
       }).catch(function(err){
       console.log(err);
});

     res.redirect('/');

    }else{
      res.render("list", {listTitle: 'Today', newListItems: foundItems});
    }

   
  }).catch(function(err){
    console.log(err);
  })

  
});



app.get('/:customListName',async function(req, res){
  const customlistName = _.capitalize(req.params.customListName) ;
  List.findOne({name: customlistName}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name: customlistName,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + customlistName)
      }else{
         res.render('list', {listTitle: foundlist.name, newListItems: foundlist.items})
      }
    }
  })
  })



  




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });


  if(listName === 'Today'){
    item.save();
  
  res.redirect('/');
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName)
    })
  }

  


});


app.post('/delete', function(req, res){
  const CheckBox = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today'){
    Item.findByIdAndRemove(CheckBox).then(function(){
      console.log('succesfully deleted!')
      res.redirect('/');
    }).catch(function(err){
      
      console.log(err);
    })
  }
  else{
   
   List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: CheckBox}}}, function(err, foundList){
    if(!err){
      res.redirect('/' + listName)
    }
   })
    

  }
 
  
  
})
















app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
