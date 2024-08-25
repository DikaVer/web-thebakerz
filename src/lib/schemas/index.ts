import * as z from 'zod';

export const LoginSchema = z.object({
        email: z.string()
            .trim()
            .min(1,
                {
                    message: 'Email required!'
                })
            .email({
                message: 'Invalid email!'
            }),
        prev_link: z.string()
});
