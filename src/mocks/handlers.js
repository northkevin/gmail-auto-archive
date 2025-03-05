import { rest } from 'msw';

export const handlers = [
  rest.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        messages: [
          { id: 'email_1', threadId: 'thread_1' },
          { id: 'email_2', threadId: 'thread_2' }
        ],
        nextPageToken: null
      })
    );
  }),

  rest.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/:messageId/modify', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: req.params.messageId,
        labelIds: ['ARCHIVED']
      })
    );
  })
];
