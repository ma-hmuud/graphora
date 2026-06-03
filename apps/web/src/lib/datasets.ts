import { env } from "@graphora/env/web";
import { tryCatch } from "./try-catch";

type GraphQLError = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

function getGraphqlUrl() {
  return "/graphql";
}

async function requestGraphql<T>(
  body: BodyInit,
  isMultipart = false,
): Promise<T> {
  const { data: response, error } = await tryCatch(
    fetch(getGraphqlUrl(), {
      method: "POST",
      body,
      credentials: "include",
      headers: isMultipart ? undefined : { "Content-Type": "application/json" },
    }),
  );

  if (error || !response) throw new Error("Failed to reach server");

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "GraphQL error");
  }

  if (!payload.data) throw new Error("No data returned");
  return payload.data;
}

import type { Dataset } from "@/lib/types";

export async function createDataset(input: {
  name: string;
  description?: string;
  file: File;
}) {
  const operations = {
    query:
      "mutation CreateDataset($input: CreateDatasetInput!, $file: Upload!) { createDataset(input: $input, file: $file) { id name description s3Key sizeBytes createdAt updatedAt fileUrl } }",
    variables: {
      input: { name: input.name, description: input.description },
      file: null,
    },
  };

  const form = new FormData();
  form.append("operations", JSON.stringify(operations));
  form.append("map", JSON.stringify({ "0": ["variables.file"] }));
  form.append("0", input.file);

  return requestGraphql<{ createDataset: Dataset }>(form, true);
}

export async function listDatasets() {
  const body = JSON.stringify({
    query:
      "query Datasets { datasets { id name description s3Key sizeBytes status errorMessage createdAt updatedAt fileUrl } }",
  });

  return requestGraphql<{ datasets: Dataset[] }>(body);
}

export async function updateDataset(input: {
  id: number;
  name?: string;
  description?: string;
}) {
  const body = JSON.stringify({
    query:
      "mutation UpdateDataset($id: Int!, $input: UpdateDatasetInput!) { updateDataset(id: $id, input: $input) { id name description s3Key sizeBytes status errorMessage createdAt updatedAt fileUrl } }",
    variables: {
      id: input.id,
      input: { name: input.name, description: input.description },
    },
  });

  return requestGraphql<{ updateDataset: Dataset }>(body);
}

export async function deleteDataset(id: number) {
  const body = JSON.stringify({
    query: "mutation DeleteDataset($id: Int!) { deleteDataset(id: $id) }",
    variables: { id },
  });

  return requestGraphql<{ deleteDataset: boolean }>(body);
}
