# BINGO

running version on https://tmmd.club/bingo

web Bingo game which
- randomly generates bingo boards based on input json file
- saves progress to cookie in json format
- optionally saves progress server-side in json format
  - requires login.php, logout.php, save_progress.php, load_progress.php and reset_progress.php on domain root and some sort of user management system


if you fork this, you'll definitely have to modify the code somewhat to point to your own server's endpoints

<sub>this codebase is currently an absolute mess, I'll probably clean it up at some point but for now, it works :P</sub>
