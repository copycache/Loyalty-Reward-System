<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Carbon\Carbon;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    protected $table = 'users';
    protected $primaryKey = "id";
    protected $guarded = [];
    public $timestamps = false;

    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'crypt',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_verified' => 'datetime',
    ];

    public function scopeJoinSlot($query)
    {
        return $query->join('tbl_slot', 'tbl_slot.slot_owner', '=', 'users.id');
    }

    public function scopeGetWeekRegistered($query)
    {
        $query->where('created_at', '>', Carbon::now()->startOfWeek())
              ->where('created_at', '<', Carbon::now()->endOfWeek());

        return $query;
    }

    public function scopeJoinPosition($query)
    {
        $query->join('tbl_position', 'tbl_position.position_id', '=', 'users.position_id');

        return $query;
    }
}
