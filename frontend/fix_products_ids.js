use('kitcerto');
const col = db.products;
const cur = col.find();
while (cur.hasNext()) {
  const d = cur.next();
  const newId = d.Id ? d.Id : (d._id && d._id.toString ? d._id.toString() : null);
  if (!newId) continue;
  d._id = newId;
  d.Id = newId;
  col.replaceOne({_id: newId}, d, {upsert: true});
  if (d._id !== newId) {
    try { col.deleteOne({_id: d._id}); } catch(e) {}
  }
}
