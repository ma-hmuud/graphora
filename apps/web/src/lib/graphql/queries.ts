import { gql } from "@apollo/client";

export const DATASETS_QUERY = gql`
  query Datasets {
    datasets {
      id
      name
      description
      sizeBytes
      rowCount
      createdAt
      updatedAt
      fileUrl
    }
  }
`;

export const DATASET_QUERY = gql`
  query Dataset($id: ID!) {
    dataset(id: $id) {
      id
      name
      description
      sizeBytes
      rowCount
      createdAt
      updatedAt
      fileUrl
    }
  }
`;

export const DATASET_HEADERS_QUERY = gql`
  query DatasetHeaders($id: ID!) {
    datasetHeaders(id: $id)
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
  query Graph($id: ID!) {
    graph(id: $id) {
      id
      name
      status
      sourceColumn
      targetColumn
      isDirected
      isWeighted
      nodeCount
      edgeCount
      density
      componentsCount
      errorMessage
      shareSlug
      graphData
      createdAt
      updatedAt
      dataset {
        id
        name
      }
    }
  }
`;
