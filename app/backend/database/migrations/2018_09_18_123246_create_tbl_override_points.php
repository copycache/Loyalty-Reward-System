<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblOverridePoints extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('tbl_override_points'))
        {            
            Schema::create('tbl_override_points', function (Blueprint $table) 
            {
                $table->increments('override_points_id');
                $table->integer('slot_id')->unsigned();
                $table->double('override_amount')->default(0);
                $table->tinyInteger('distributed')->default(0);
                $table->dateTime('override_points_date_created');
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
