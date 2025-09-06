use('kitcerto');
const col = db.products;
const docs = col.find().toArray();
docs.forEach(orig => {
  const newId = (orig.Id && typeof orig.Id === 'string' ? orig.Id : (orig._id && orig._id.toString ? orig._id.toString() : null));
  if (!newId) return;
  const newDoc = Object.assign({}, orig);
  delete newDoc._id;
  newDoc._id = newId;
  newDoc.Id = newId;
  // upsert por _id string
  col.replaceOne({_id: newId}, newDoc, {upsert: true});
  // se o antigo era ObjectId diferente, remover
  if (orig._id && orig._id.toString && orig._id.toString() !== newId) {
    try { col.deleteOne({_id: orig._id}); } catch(e) {}
  }
});
