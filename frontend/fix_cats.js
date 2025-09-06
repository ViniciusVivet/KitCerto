use('kitcerto');
const cats = db.categories.find().toArray();
db.categories.deleteMany({});
cats.forEach(c => {
  db.categories.insertOne({_id: c.Id ?? c._id, Name: c.Name, Description: c.Description});
});
