'use client'

import {
  FormEvent,
  useState,
} from 'react'

type FormState =
  | 'idle'
  | 'sending'
  | 'success'
  | 'error'

export default function ContactForm() {
  const [state, setState] =
    useState<FormState>('idle')

  const [errorMessage, setErrorMessage] =
    useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setState('sending')
    setErrorMessage('')

    const form =
      event.currentTarget

    const formData =
      new FormData(form)

    const payload = {
      name:
        String(
          formData.get('name') || ''
        ).trim(),

      email:
        String(
          formData.get('email') || ''
        ).trim(),

      subject:
        String(
          formData.get('subject') || ''
        ).trim(),

      category:
        String(
          formData.get('category') || ''
        ).trim(),

      orderReference:
        String(
          formData.get('orderReference') || ''
        ).trim(),

      message:
        String(
          formData.get('message') || ''
        ).trim(),

      /*
       * Honeypot spam field.
       * Real users never see this field.
       */
      website:
        String(
          formData.get('website') || ''
        ).trim(),
    }

    try {
      const response =
        await fetch(
          '/api/contact',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Your message could not be sent.'
        )
      }

      form.reset()

      setState(
        'success'
      )
    } catch (error) {
      setState(
        'error'
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Your message could not be sent.'
      )
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {/*
       * HONEYPOT
       *
       * Hidden from normal visitors.
       */}
      <div
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Your name *
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="Full name"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Email address *
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          What can we help with? *
        </label>

        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-amber-300/60"
        >
          <option
            value=""
            disabled
          >
            Select a category
          </option>

          <option value="Payment issue">
            Payment issue
          </option>

          <option value="Download issue">
            Download issue
          </option>

          <option value="Artwork enquiry">
            Artwork enquiry
          </option>

          <option value="Licensing / commercial use">
            Licensing / commercial use
          </option>

          <option value="Complaint">
            Complaint
          </option>

          <option value="Recommendation">
            Recommendation
          </option>

          <option value="Artwork request">
            Artwork request
          </option>

          <option value="Website problem">
            Website problem
          </option>

          <option value="General enquiry">
            General enquiry
          </option>

          <option value="Other">
            Other
          </option>
        </select>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Subject *
        </label>

        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          placeholder="Brief description of your enquiry"
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
        />
      </div>

      <div>
        <label
          htmlFor="orderReference"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Order / payment reference
          <span className="ml-2 font-normal text-slate-500">
            Optional
          </span>
        </label>

        <input
          id="orderReference"
          name="orderReference"
          type="text"
          maxLength={250}
          placeholder="Checkout or payment reference, if applicable"
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Message *
        </label>

        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={8}
          placeholder="Please give us as much information as possible so we can assist you."
          className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
        />
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Please do not include passwords, full credit card numbers
        or other sensitive financial information.
      </p>

      {state ===
      'success' ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          Thank you. Your message has been sent successfully to
          AI Image Support.
        </div>
      ) : null}

      {state ===
      'error' ? (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          {errorMessage}
          {' '}
          You can also email us directly at{' '}
          <a
            href="mailto:aiimagesupport@gmail.com"
            className="font-semibold underline"
          >
            aiimagesupport@gmail.com
          </a>
          .
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          state ===
          'sending'
        }
        className="rounded-xl bg-amber-400 px-7 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state ===
        'sending'
          ? 'Sending…'
          : 'Send Message'}
      </button>
    </form>
  )
}
