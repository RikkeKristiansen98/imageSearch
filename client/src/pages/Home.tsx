import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { ISearchGoogleResult } from "../models/SearchGoogleResults";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";

export const Home = () => {
  const { isAuthenticated } = useAuth0();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ISearchGoogleResult>({
    context: { title: "" },
    items: [],
    searchInformation: { searchTime: "" },
  });

  const saveFavoriteImage = async (imageUrl: string) => {
    try {
      await axios.post("http://localhost:3001/favorites", { imageUrl });
      console.log("Favorite image saved successfully");
    } catch (error) {
      console.error("Error saving favorite image:", error);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${import.meta.env.VITE_GOOGLE_API_KEY}&cx=${import.meta.env.VITE_SEARCH_ENGINE_KEY}&num=10&searchType=image&q=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: ISearchGoogleResult = await response.json();
      setSearchResults(data);
      setSearchQuery("");
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDidYouMean = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setSearchQuery(event.currentTarget.textContent || ""); 
    await handleSearch(event.currentTarget.textContent || "");
  };

  return (
    <div className="container mt-5">
      {isAuthenticated ? (
        <>
          <div className="mb-3 d-flex">
            <input type="text" placeholder="Search images" className="form-control" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button className="btn btn-primary ms-2" onClick={() => handleSearch(searchQuery)}>Search</button>
          </div>
          <p>Search Time: {searchResults.searchInformation.searchTime}</p>
          {searchResults.spelling && searchResults.spelling.correctedQuery && (
            <p>
              Did you mean:{" "}
              <button className="btn btn-link p-0" onClick={handleDidYouMean}>
                {searchResults.spelling.correctedQuery}
              </button>
            </p>
          )}
          <div className="row">
            {searchResults.items.map((result, index) => (
              <div className="col-md-3 mb-3" key={index}>
                <img className="img-fluid" src={result.link} alt={`Image ${index}`}/>
                <button className="btn btn-primary" onClick={() => saveFavoriteImage(result.link)}>Save to Favorites</button>
              </div>
            ))}
          </div>
        </>
      ) : (
       <><p>Log in to search after images and save your favorites.</p> </> 
      )}
    </div>
  );
};
