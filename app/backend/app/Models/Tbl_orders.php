<?php
namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tbl_orders extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $table = 'tbl_orders';

    protected $primaryKey = 'order_id';

    public $timestamps = false;

    public function scopeGetWeekOrder($query)
    {
        $query  ->where('order_date_created', '>', Carbon::now()->startOfWeek())
                ->where('order_date_created', '<', Carbon::now()->endOfWeek());

        return $query;
    }
}
