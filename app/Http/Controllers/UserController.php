<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Sucursale;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $users = User::with(['sucursal', 'roles'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Usuarios/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
            'sucursales' => Sucursale::where('estado', true)->get(),
            'roles' => Role::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', Rules\Password::defaults()],
            'sucursal_id' => 'required|exists:sucursales,id',
            'role' => 'required|exists:roles,name',
            'status' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'sucursal_id' => $request->sucursal_id,
            'status' => $request->input('status', true),
        ]);

        $user->assignRole($request->role);

        return back()->with('success', 'Usuario creado correctamente');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$id,
            'password' => ['nullable', Rules\Password::defaults()],
            'sucursal_id' => 'required|exists:sucursales,id',
            'role' => 'required|exists:roles,name',
            'status' => 'boolean',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'sucursal_id' => $request->sucursal_id,
            'status' => $request->input('status', true),
        ]);

        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        $user->syncRoles([$request->role]);

        return back()->with('success', 'Usuario actualizado');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        
        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminarte a ti mismo');
        }

        $user->delete();

        return back()->with('success', 'Usuario eliminado');
    }
}
