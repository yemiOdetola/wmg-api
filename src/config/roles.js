const allRoles = {
  user: [],
  recycler: [],
  admin: ['getUsers', 'manageUsers', 'manageListings'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
