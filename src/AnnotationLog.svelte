<script>

export let messages = [];
$: messages;

function _usable() {
  return {
    update(_1) {

    },
    destroy() {

    }
  };
}

</script>

<section use:_usable={messages}>
  {#each messages as message}
  <div class="container {message.is_me ? '' : 'darker'}">
    <img src="{message.profile}" alt="">
    <p>{message.text}</p>
    <span class="time-{message.is_me ? 'left' : 'right'}">
      {(new Date()).toLocaleTimeString()}
    </span>
  </div>
  {/each}
</section>

<style>

.right {
  width:100%;
}

section {
  margin: 0 auto;
  max-width: 800px;
  padding: 0 20px;
}

.container {
  border: 2px solid #dedede;
  background-color: #f1f1f1;
  border-radius: 5px;
  padding: 10px;
  margin: 10px 0;
}

.darker {
  border-color: #ccc;
  background-color: #ddd;
}

.container::after {
  content: "";
  clear: both;
  display: table;
}

.container img {
  float: left;
  max-width: 60px;
  width: 100%;
  margin-right: 20px;
  border-radius: 50%;
}

.container img.right {
  float: right;
  margin-left: 20px;
  margin-right:0;
}

.time-right {
  float: right;
  color: #aaa;
}

.time-left {
  float: left;
  color: #999;
}

</style>
