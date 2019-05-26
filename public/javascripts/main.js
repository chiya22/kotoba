{
  const container = document.querySelector(".container");
  container.addEventListener("dblclick", () => {
    alert("ダブルクリックしたよ");
    document.location = "/";
  });
}