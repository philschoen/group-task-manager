import {
  Form,
  Link,
  useActionData,
  useSearchParams,
  useNavigation,
} from '@remix-run/react';
import { FaLock, FaUserPlus } from 'react-icons/fa';
import { ValidationError } from '~/utils/validation.server';

function AuthForm() {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const validationErrors = useActionData() as ValidationError;

  const authMode = searchParams.get('mode') || 'login';

  const submitBtnCaption = authMode === 'login' ? 'Login' : 'Create Account';
  const toggleBtnCaption =
    authMode === 'login' ? 'Create a new account' : 'Log in with existing account';

  const isSubmitting = navigation.state !== 'idle';

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      <Form method="post" className="space-y-6">
        <div className="flex justify-center text-4xl mb-6">
          {authMode === 'login' ? (
            <FaLock className="text-blue-600" />
          ) : (
            <FaUserPlus className="text-green-600" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              minLength={7}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {validationErrors && (
          <ul className="text-sm text-red-600 space-y-1">
            {Object.values(validationErrors).map((error) => (
              <li key={error} className="flex items-start">
                <span className="ml-2">{error}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : authMode === 'login'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-600 hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${authMode === 'login' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
              }`}
          >
            {isSubmitting ? 'Authenticating...' : submitBtnCaption}
          </button>

          <Link
            to={authMode === 'login' ? '?mode=signup' : '?mode=login'}
            className="block text-center text-sm text-blue-600 hover:text-blue-500"
          >
            {toggleBtnCaption}
          </Link>
        </div>
      </Form>
    </div>
  );
}

export default AuthForm;