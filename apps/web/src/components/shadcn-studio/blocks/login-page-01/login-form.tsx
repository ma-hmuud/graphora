'use client'

import { useState } from 'react'
import { Button } from '@graphora/ui/components/button'
import { Checkbox } from '@graphora/ui/components/checkbox'
import { Input } from '@graphora/ui/components/input'
import { EyeOffIcon, EyeIcon } from 'lucide-react'

// Field components fallbacks if Field group is not installed via shadcn
const FieldGroup = ({ className, children, ...props }: React.ComponentProps<'div'>) => (
  <div className={`flex flex-col gap-4 ${className || ''}`} {...props}>{children}</div>
)
const Field = ({ className, orientation = 'vertical', children, ...props }: React.ComponentProps<'div'> & { orientation?: 'vertical' | 'horizontal' }) => (
  <div className={`flex ${orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col'} gap-2 ${className || ''}`} {...props}>{children}</div>
)
const FieldLabel = ({ className, htmlFor, children, ...props }: React.ComponentProps<'label'>) => (
  <label htmlFor={htmlFor} className={`text-xs font-medium text-foreground ${className || ''}`} {...props}>{children}</label>
)

// InputGroup fallbacks since they are not standard shadcn-ui CLI components
const InputGroup = ({ className, children, ...props }: React.ComponentProps<'div'>) => (
  <div className={`relative flex items-center w-full ${className || ''}`} {...props}>{children}</div>
)
const InputGroupInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
  <Input className={`pr-10 ${className || ''}`} {...props} />
)
const InputGroupAddon = ({ className, align = 'inline-end', children, ...props }: React.ComponentProps<'div'> & { align?: 'inline-start' | 'inline-end' }) => (
  <div className={`absolute ${align === 'inline-end' ? 'right-0' : 'left-0'} flex items-center justify-center ${className || ''}`} {...props}>{children}</div>
)

const LoginForm = () => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <form onSubmit={e => e.preventDefault()}>
      {/* Email */}
      <FieldGroup className='gap-4'>
        <Field className='gap-2'>
          <FieldLabel htmlFor='userEmail' className='leading-5'>
            Email address*
          </FieldLabel>
          <Input type='email' id='userEmail' placeholder='Enter your email address' />
        </Field>
        {/* Password */}
        <Field className='gap-2'>
          <FieldLabel htmlFor='password' className='leading-5'>
            Password*
          </FieldLabel>
          <InputGroup>
            <InputGroupInput id='password' type={isVisible ? 'text' : 'password'} placeholder='••••••••••••••••' />
            <InputGroupAddon align='inline-end' className='pr-1.5'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsVisible(prevState => !prevState)}
                className='text-muted-foreground rounded-l-none hover:bg-transparent'
              >
                {isVisible ? (
                  <EyeOffIcon />
                ) : (
                  <EyeIcon />
                )}
                <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        {/* Remember Me and Forgot Password */}
        <div className='flex items-center justify-between gap-y-2'>
          <Field orientation='horizontal' className='flex items-center gap-2'>
            <Checkbox id='rememberMe' />
            <FieldLabel htmlFor='rememberMe' className='text-muted-foreground cursor-pointer'>
              Remember Me
            </FieldLabel>
          </Field>

          <a href='#' className='text-xs text-nowrap hover:underline text-muted-foreground hover:text-foreground'>
            Forgot Password?
          </a>
        </div>

        <Field>
          <Button className='w-full' type='submit'>
            Sign in to Shadcn Studio
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default LoginForm
