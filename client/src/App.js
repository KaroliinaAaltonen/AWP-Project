import './App.css';

function App() {

  const submitForm = (event) => {
    event.preventDefault();
    
    var name = event.target.name.value;
    var author = event.target.author.value;
    var pages = event.target.pages.value;

    console.log("Name:", name); // Logging the name to the console

    fetch("/api/book", { // Posting to the specified URL (backend is in localhost:1234 idk)
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "name": name,
        "author": author,
        "pages": pages
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data); // Logging the response data to the console
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  return (
    <>
    <div>
      <h1>Books</h1>     

      <form onSubmit={(event) => {
        event.preventDefault();
        submitForm(event);
      }}>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" /><br/>
        <label htmlFor="author">Author</label>
        <input id="author" name="author" /><br/>
        <label htmlFor="pages">Pages</label>
        <input id="pages" name="pages" type="number"/><br/>
        <input type="submit" value="Submit" />
      </form>
    </div>
    </>
  );
}

export default App;
