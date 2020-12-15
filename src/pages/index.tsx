import React, { useState } from "react";
import AddBookmark from "./AddBookmark";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { Link } from "gatsby";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ButtonAppBar from "./Header";
import "./main.css";
import Loader from "./loader";
const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
});
const BOOKMARK_QUERY = gql`
  {
    bookmark {
      id
      url
      title
      image
      description
    }
  }
`;

const ADD_BOOKMARK = gql`
  mutation addBookMark(
    $url: String!
    $description: String!
    $title: String!
    $image: String!
  ) {
    addBookMark(
      url: $url
      description: $description
      title: $title
      image: $image
    ) {
      url
    }
  }
`;

const REMOVE_BOOKMARK = gql`
  mutation removeBookMark($id: ID!) {
    removeBookMark(id: $id) {
      id
    }
  }
`;

export default function Home() {
  const classes = useStyles();
  const [url, setUrl] = useState("");
  const [description, setDescp] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const { loading, error, data } = useQuery(BOOKMARK_QUERY);
  const [bookmark] = useMutation(ADD_BOOKMARK);
  const [removeBookmark] = useMutation(REMOVE_BOOKMARK);

  let addBookMark = () => {
    bookmark({
      variables: {
        url: url,
        description: description,
        title: title,
        image: image,
      },
      refetchQueries: [{ query: BOOKMARK_QUERY }],
    });
  };
  let removeBookMark = (e) => {
      removeBookmark({
        variables: {
          id: e,
        },
        refetchQueries: [{ query: BOOKMARK_QUERY }],
      });
  };
  if (loading) return <Loader />;
  if (error) {
    return <p> Error ....</p>;
  }
  return (
    <div>
      <ButtonAppBar />
      <div className="App">
        <AddBookmark
          setUrl={setUrl}
          setDescp={setDescp}
          setTitle={setTitle}
          setImage={setImage}
          addBookMark={addBookMark}
        />
        {data ? (
          <div className="App">
            {" "}
            {data.bookmark.map((d, i) => (
              <div key={i} className="cards">
                <Card className={classes.root}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      alt={d.title}
                      height="140"
                      image={d.image}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        {d.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                      >
                        {d.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                      <a href={d.url}>
                    <Button size="small" color="primary">
                        Read More
                    </Button>
                        </a>
                    <Button
                      size="small"
                      color="primary"
                      onClick={(e) => removeBookMark(d.id)}
                    >
                      Remove BookMark
                    </Button>
                  </CardActions>
                </Card>
              </div>
            ))}{" "}
          </div>
        ) : null}
      </div>
    </div>
  );
}
