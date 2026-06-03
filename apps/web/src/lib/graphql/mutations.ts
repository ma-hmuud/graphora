import { gql } from "@apollo/client";

export const CREATE_GRAPH_MUTATION = gql`
  mutation CreateGraph($input: CreateGraphInput!) {
    createGraph(input: $input) {
      id
      name
      status
      sourceColumn
      targetColumn
      dataset {
        id
        name
      }
    }
  }
`;

export const CREATE_DATASET_MUTATION = gql`
  mutation CreateDataset($input: CreateDatasetInput!, $file: Upload!) {
    createDataset(input: $input, file: $file) {
      id
      name
    }
  }
`;

export const DELETE_GRAPH_MUTATION = gql`
  mutation DeleteGraph($id: ID!) {
    deleteGraph(id: $id)
  }
`;

export const REGENERATE_GRAPH_MUTATION = gql`
  mutation RegenerateGraph($id: ID!) {
    regenerateGraph(id: $id) {
      id
      status
    }
  }
`;
