const users = [];
const addUser = ({ socket_id, name, user_id /*, room_id*/ }) => {
  const exist = users.find(
    (user) => /*user.room_id === room_id &&*/ user.user_id === user_id
  );
  if (exist) {
    return { error: "User already exist in this room" };
  }
  const user = { socket_id, name, user_id /*room_id*/ };
  users.push(user);
  console.log("⚪⚪⚪⚪⚪ usrs list ⚪⚪⚪⚪⚪ \n", users);
  return { user };
};
const removeUser = (socket_id) => {
  const index = users.findIndex((user) => user.socket_id === socket_id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
const getUser = (socket_id) =>
  users.find((user) => user.socket_id === socket_id);

const getUserById = (user_id) => {
  console.log("THE EVALUATION", user_id);
  return users.find((user) => user.user_id === user_id);
};
const updateUserByRoomId = (user_id, room_id) => {
  let user_index = users.findIndex((user) => user.user_id === user_id); //getUserById(user_id);
  users[user_index].room_id = room_id;
  const user = users.find(
    (user) => user.room_id === room_id && user.user_id === user_id
  );
  // updating the user by its room_id ie the user_obj will also contain room_id along with name/user_id/socket_id
  console.log("⭐⭐⭐⭐⭐⭐⭐ list users", users);
  console.log("user that will be returned", user);
  return { user };
};
module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserById,
  updateUserByRoomId,
};
