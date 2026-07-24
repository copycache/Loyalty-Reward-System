<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdtTblOrdersAddDateStatusChanged extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(!Schema::hasColumn('tbl_orders', 'date_status_changed'))
        {
            Schema::table('tbl_orders', function (Blueprint $table) 
            {
                $table->dateTime('date_status_changed')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
