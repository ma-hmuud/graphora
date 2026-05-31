import { gql } from "@apollo/client";

export const DATASETS_QUERY = gql`
  query Datasets {
    datasets {
      id
      name
      description
      sizeBytes
      rowCount
      status
      createdAt
      updatedAt
      fileUrl
    }
  }
`;

export const DATASET_QUERY = gql`
  query Dataset($id: Int!) {
    dataset(id: $id) {
      id
      name
      description
      sizeBytes
      rowCount
      status
      createdAt
      updatedAt
      fileUrl
    }
  }
`;

export const GRAPHS_QUERY = gql`
  query Graphs {
    graphs {
      id
      name
      status
      isDirected
      isWeighted
      nodeCount
      edgeCount
      density
      componentsCount
      shareSlug
      layoutPreference
      createdAt
      updatedAt
      dataset {
        id
        name
      }
    }
  }
`;

export const GRAPH_QUERY = gql`
  query Graph($id: Int!) {
    graph(id: $id) {
      id
      name
      status
      isDirected
      isWeighted
      nodeCount
      edgeCount
      density
      componentsCount
      shareSlug
      layoutPreference
      createdAt
      updatedAt
      dataset {
        id
        name
      }
    }
  }
`;
