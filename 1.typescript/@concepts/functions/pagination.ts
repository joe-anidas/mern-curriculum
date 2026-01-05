function getUsers(
  page: number = 1,
  limit: number = 10
): string {
  return `Fetching users from page ${page} with limit ${limit}`;
}

console.log(getUsers());
console.log(getUsers(2));
console.log(getUsers(2, 20));
