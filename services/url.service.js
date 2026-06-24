// Refactor-Create function for inserting,getting URL in DB(All dbs)
// const [result] = await db
//     .insert(urlsTable)
//     .values({
//       shortCode,
//       targetURL: url,
//       userId: req.user.id,
//     })
//     .returning({
//       id: urlsTable.id,
//       shortCode: urlsTable.shortCode,
//       targetURL: urlsTable.targetURL,
//     });