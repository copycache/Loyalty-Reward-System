<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblTinLogs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(!Schema::hasTable('tbl_tin_logs'))
        {
            Schema::create('tbl_tin_logs', function (Blueprint $table) 
            {
                $table->increments('tin_logs_id');
                $table->integer("user_id")->unsigned();
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->text("tin")->nullable();
                $table->dateTime("tin_date_change");
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
