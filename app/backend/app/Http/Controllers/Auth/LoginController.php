<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

use App\Globals\Visitor;
use App\Models\Tbl_slot;

class LoginController extends Controller
{
    protected $redirectTo = '/home';

    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    public function username()
    {
        return 'email';
    }

    public function login(Request $request)
    {
        Visitor::use_the_counter();

        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $username = $request->email;

        $check_slot_code = Tbl_slot::owner()->where('slot_no', $username)->first();
        if($check_slot_code)
        {
            $username = $check_slot_code->email;
        }

        if (Auth::guard('web')->attempt(
            ['email' => $username, 'password' => $request->password],
            $request->boolean('remember')
        )) {
            $request->session()->regenerate();
            $user = Auth::guard('web')->user();
            return response()->json($user->toArray());
        }

        throw ValidationException::withMessages([
            'email' => [trans('auth.failed')],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'User logged out.'], 200);
    }
}
