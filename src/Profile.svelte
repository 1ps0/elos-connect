<script>
/*
WHOAMI

1. identifying information
2. personal/private profile
3. public profile
4. communications preferences
5. key interests
6. machine user (m2m systems)
7. learning topics
8. expertise topics
9. authentications
10. external integrations
11. rules and templates
12. loaded packages
13. passive backlog (stash)
14. package/playlist builder
15. sync options
16,

*/
import { onMount } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

// import { profileEdit } from "./lib/profileEdit.js";

export let settings = {
    'default': 0,
    'persona_name': 'random',
    'learning_method': 'text-only',

}

onMount(async () => {
  console.log('Profile mounted');
});


</script>

<section class="title">
<!--   <img use:profileEdit src="img/img_avatar.png" alt="Avatar" class="avatar"/>
 --></section>

<style>

.title {
  background-color: #ccc;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  outline: none;
}

.avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  /*float: right;*/
  border-radius: 50%;
}
</style>
