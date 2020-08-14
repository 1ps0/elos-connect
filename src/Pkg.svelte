<script>

export let uri;


async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

</script>



<style></style>