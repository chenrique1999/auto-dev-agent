#!/usr/bin/env node
import fs from 'fs';

const HOST = process.env.PUBLIC_AGENT_URL || 'https://agent.galaxifyos.com';
const argv = new Set(process.argv.slice(2));
const enableLogsJson = argv.has('--logs-json');  // opcional

const spec = {
  openapi: '3.1.0',
  info: { title: 'Local Agent', version: '1.0.0' },
  servers: [{ url: HOST }],
  paths: {
    '/health': {
      get: { operationId: 'health', summary: 'Health check', responses: { '200': { description: 'OK' } } }
    },
    '/workspaces': {
      get: {
        operationId: 'workspacesList',
        summary: 'Lista workspaces disponíveis',
        security: [{ apiKeyAuth: [] }],
        responses: { '200': { description: 'OK' } }
      }
    },
    '/run-async': {
      post: {
        operationId: 'runAsync',
        summary: 'Executa comando no repositório local',
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['task'],
                properties: {
                  task: { type: 'string' },
                  workspace: { type: 'string', description: 'Workspace key (ex.: "agent" ou "repo")' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Tarefa criada' } }
      }
    },
    '/tasks/{id}/status': {
      get: {
        operationId: 'taskStatus',
        summary: 'Status da tarefa',
        security: [{ apiKeyAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } }
      }
    },
    '/tasks/{id}/logs-plain': {
      get: {
        operationId: 'taskLogsPlain',
        summary: 'Logs em texto',
        security: [{ apiKeyAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } }
      }
    },
    '/recipes/list': {
      get: {
        operationId: 'recipesList',
        summary: 'Lista as receitas disponíveis',
        security: [{ apiKeyAuth: [] }],
        responses: { '200': { description: 'OK' } }
      }
    },
    '/recipes/run': {
      post: {
        operationId: 'recipesRun',
        summary: 'Executa uma receita por nome',
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  dry: { type: 'boolean', default: false },
                  args: { type: 'object', additionalProperties: true },
                  workspace: { type: 'string', description: 'Workspace key (ex.: "agent" ou "repo")' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Tarefa criada' } }
      }
    }
  },
  components: {
    securitySchemes: { apiKeyAuth: { type: 'apiKey', in: 'header', name: 'Authorization' } },
    schemas: {}
  }
};

if (enableLogsJson) {
  spec.paths['/tasks/{id}/logs-json'] = {
    get: {
      operationId: 'taskLogsJson',
      summary: 'Obtém logs em JSON (paginado)',
      security: [{ apiKeyAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'cursor', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } }
      ],
      responses: { '200': { description: 'OK' } }
    }
  };
}

fs.writeFileSync('openapi.json', JSON.stringify(spec, null, 2));
console.log('[ok] wrote openapi.json with options:', { enableLogsJson, HOST });
